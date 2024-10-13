#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import asyncio
import logging
import uuid
import os
import time

logging.basicConfig(format=u'%(filename)s[LINE:%(lineno)d]# %(levelname)-8s [%(asctime)s]  %(message)s',
                    level=logging.DEBUG)
import os.path
import sys
SOCKET_PING_INTERVAL = 30
_DEFAULT_LIMIT = 2**30


class SocketClient:
    """
    Client socket object for sending and receiving JSON messages
    """

    def __init__(self, address, handler_functions, storage_dir=None, reader=None, writer=None):
        """
        Initialize client object
        
        :param address: array
        :param handler_functions: dict, keys - handling action, values - function to handle message, must be coroutine
        :param storage_dir: string, directory for storing messages on terminate
        :param reader: socket stream reader
        :param writer: socket stream writer
        """
        self._host = address[0]
        self._port = address[1]
        self._reader = reader
        self._writer = writer
        self._wait_tasks = None
        self._storage_dir = storage_dir
        self._handler_functions = handler_functions
        self._loop = asyncio.get_event_loop()
        self._message_queue = asyncio.Queue(loop=self._loop)
        self._incoming_message_queue = asyncio.Queue(loop=self._loop)
        self.load_saved_messages()
        self._connected = False
        self._terminate = False
        self._handler_started = False
        self.ponged = True
        self.last_ping_at = time.time()
        self.last_ping_time = 0
        self.wait_responses = {}

    @asyncio.coroutine
    def message_handler(self):
        """
        Get messages from queue and handle it
        :return: 
        """
        logging.info("start handler on %s" % self._host)
        self._handler_started = True
        while not self._terminate:
            # I made this so that sender will correctly finish on terminate
            if self._incoming_message_queue.qsize() > 0:
                logging.debug("messages in handler queue %d" % self._incoming_message_queue.qsize())
                message = yield from self._incoming_message_queue.get()
                try:
                    result = yield from self._handler_functions[message["action"]](message)
                    if result:
                        if "action_id" in message.keys():
                            result["action_id"] = message["action_id"]
                        self.append_message(result)

                except Exception as ex:
                    logging.error("handling error in line %s: %s" % (str(sys.exc_info()[-1].tb_lineno), str(ex)))
                    self._incoming_message_queue.put_nowait(message)
            else:
                yield from asyncio.sleep(0.1)
        logging.info("end handler on %s" % self._host)

    @asyncio.coroutine
    def wait_for_disconnect(self):
        """
        Waiting for finish tasks
        :return: 
        """
        if self._wait_tasks is not None:
            yield from self._wait_tasks

    @asyncio.coroutine
    def connector(self, limit=_DEFAULT_LIMIT):
        """
        Endless function for connect to remote server
        Auto-reconnect on socket disconnections

        """
        while not self._terminate:
            if not self._connected:
                yield from self.wait_for_disconnect()
                logging.debug("connecting to server %s" % self._host)
                try:
                    asyncio.set_event_loop(self._loop)
                    reader, writer = yield from asyncio.open_connection(self._host, self._port,
                                                                        loop=self._loop, limit=limit)
                    self.start(reader, writer, True)
                except OSError:
                    logging.error("connection to server %s failed!" % self._host)
                    self.disconnect()
            yield from asyncio.sleep(2.0)

    def start(self, reader, writer, with_pinger=False):
        """
        Function for start sender and receiver tasks
        
        :param reader: socket stream reader
        :param writer: socket stream writer
        :param with_pinger: whether to start pinger task or not
        :return: boolean, whether reader and writer start
        """
        if not self.connected():
            self._connected = True
            self._reader = reader
            self._writer = writer
            tasks = [self._loop.create_task(self._sender()), self._loop.create_task(self._receiver())]
            if with_pinger:
                tasks.append(self._loop.create_task(self.pinger()))
            if not self._handler_started:
                self._loop.create_task(self.message_handler())
            self._wait_tasks = asyncio.wait(tasks)
            return True
        else:
            logging.warning("connection to server %s already exists!" % self._host)
            return False

    @asyncio.coroutine
    def _receiver(self):
        """
        Loop for receive and handle data from remote host
        Run while connection opened
        """
        logging.info("start receiver on %s" % self._host)
        while self.connected():
            try:
                message = yield from self.receive_json()
                if message:
                    if "action_id" in message.keys():
                        if message["action_id"] in self.wait_responses.keys():
                            future = self.wait_responses.pop(message["action_id"])
                            future.set_result(message)
                    if message["action"] == 'pong':
                        self.last_ping_time = time.time() - self.last_ping_at
                        self.ponged = True
                    if message["action"] == 'ping':
                        logging.debug("received ping")
                        self.append_message({"action": "pong", "status": "success"})
                    if message["action"] in self._handler_functions.keys():
                        self._incoming_message_queue.put_nowait(message)
            except Exception as ex:
                logging.error("receiver error in line %s: %s" % (str(sys.exc_info()[-1].tb_lineno), str(ex)))
        logging.info("end receiver on %s" % self._host)

    @asyncio.coroutine
    def _sender(self):
        """
        Loop for read data from message queue and send it to remote host
        Run while connection opened
        """
        logging.info("start sender on %s" % self._host)
        while self.connected():
            # I made this so that sender will correctly finish on disconnect
            if self._message_queue.qsize() > 0:
                message = yield from self._message_queue.get()
                try:
                    logging.debug("Send: %r" % message)
                    message = message + "\n"
                    data = message.encode()
                    self._writer.write(data)
                    yield from self._writer.drain()
                except Exception as ex:
                    logging.error("sending error in line %s: %s" % (str(sys.exc_info()[-1].tb_lineno), str(ex)))
                    self._message_queue.put_nowait(message)
                    self.disconnect()
            else:
                yield from asyncio.sleep(1)
        logging.info("end sender on %s" % self._host)

    @asyncio.coroutine
    def pinger(self):
        """
        Loop for send ping actions to remote host and waiting for pong
        Run while connection opened
        """
        while self.connected():
            self.ponged = False
            self.last_ping_at = time.time()
            self.append_message({"action": "ping"})
            yield from asyncio.sleep(SOCKET_PING_INTERVAL)
            if not self.ponged and self.connected():
                logging.error("pong from %s not received in %d seconds, disconnect" % (self._host,
                                                                                       SOCKET_PING_INTERVAL))
                self.disconnect()

    @asyncio.coroutine
    def receive_json(self):
        """
        Receive json string and decode it to object
        
        :return: message object or False if remote host disconnected
        """
        try:
            data = yield from self._reader.readline()
            message = data.decode()
            if message != '':
                logging.debug("Received %r from %r" % (message, self._host))
                message_object = json.loads(message)
                return message_object
            else:
                self.disconnect()
                return None
        except Exception as ex:
            logging.error("receiver error in line %s: %s" % (str(sys.exc_info()[-1].tb_lineno), str(ex)))
            self.disconnect()
            return None

    def connected(self):
        return self._connected

    def append_message(self, message_object, wait_for_response=False, response_timeout=30.0, action_id=None):
        """
        Append message to message queue and wait for message response if wait_for_response is True
        
        :param message_object: json-serializable object, message to send
        :param wait_for_response: boolean, whether wait for response or not
        :param response_timeout: unsigned float
        :param action_id: message action id for tracking response (if not specified, it will be generated automatically)
        :return: boolean or response message if wait_for_response is True and response accepted
        """
        if action_id is None and "action_id" not in message_object.keys():
            action_id = str(uuid.uuid4())
            message_object["action_id"] = action_id
        result = True
        message = json.dumps(message_object)
        future = asyncio.Future(loop=self._loop)
        if wait_for_response:
            self.wait_responses[message_object["action_id"]] = future
        self._message_queue.put_nowait(message)
        if wait_for_response:
            time_passed = 0.0
            while not future.done():
                time.sleep(0.1)
                time_passed += 0.1
                if time_passed > response_timeout:
                    future.cancel()
                    self.wait_responses.pop(message_object["action_id"])
            if future.cancelled():
                # TODO: maybe should throw new exception
                result = False
            else:
                result = future.result()
        return result

    def save_all_messages(self):
        """
        Save all messages in queue to file 
        """
        if self._storage_dir:
            with open(self._storage_dir + 'queries_%s.txt' % self._host, "a") as queries_file:
                while self._message_queue.qsize() > 0:
                    message = yield from self._message_queue.get()
                    queries_file.write("%s\n" % message)

    def load_saved_messages(self):
        """
        Load all messages from file to queue
        """
        if self._storage_dir:
            if os.path.isfile(self._storage_dir + 'queries_%s.txt' % self._host):
                with open(self._storage_dir + 'queries_%s.txt' % self._host, "r") as queries_file:
                    messages = queries_file.read()
                    messages = messages.split('\n')
                    for message in messages:
                        if message:
                            self._message_queue.put_nowait(message)
            # Truncate queries file
            open(self._storage_dir + 'queries_%s.txt' % self._host, 'w').close()

    def disconnect(self):
        if self._connected:
            self._connected = False
            if not self._loop.is_closed():
                self._writer.close()

    def __del__(self):
        self.disconnect()
        self.save_all_messages()
        self._terminate = True

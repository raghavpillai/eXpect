#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import time
import asyncio
import logging
from configparser import ConfigParser

logging.basicConfig(format=u'%(filename)s[LINE:%(lineno)d]# %(levelname)-8s [%(asctime)s]  %(message)s',
                    level=logging.DEBUG)
import os.path
import sys
import socket
import netifaces as ni
from .client import SocketClient

_DEFAULT_LIMIT = 2**30


class SocketServer:
    """
    Server socket object for manage clients and handling messages
    """

    def __init__(self, handler_functions, filename_or_fd, section='server', limit=_DEFAULT_LIMIT):
        """
        Initialize socket server object
        
        :param handler_functions: functions for handling messages, functions results will sent back to client
        :param filename_or_fd: string or fd, file to read config from
        :param section: config section
        """
        self._handler_functions = handler_functions
        self._server = None
        self.terminated = False
        self._clients = {}
        try:
            config = ConfigParser()
            if hasattr(filename_or_fd, 'read'):
                config.readfp(filename_or_fd)
            else:
                config.read(filename_or_fd)
            self.configs = dict(config.items(section))
            self.server_ip = "0.0.0.0"
            self.port = int(self.configs["port"])
            self.white_list = [socket.gethostbyname(address) for address in self.configs["white_list"].split(", ")]
            self._loop = asyncio.get_event_loop()
            logging.debug("start socket server on %s:%d" % (self.server_ip, self.port))
            server = asyncio.start_server(self._new_connection, self.server_ip, self.port, loop=self._loop, limit=limit)
            self._server = self._loop.run_until_complete(server)
            self._handler_functions = handler_functions
            self._storage_dir = self.configs["storage_dir"]
        except Exception as ex:
            logging.error("init error in line %s: %s" % (str(sys.exc_info()[-1].tb_lineno), str(ex)))
            raise ex

    def broadcast_message(self, message):
        """
        Function for broadcast message to all clients
        
        :param message: json-serializable object
        """
        for key, client in self._clients.items():
            client.append_message(message)

    @asyncio.coroutine
    def _new_connection(self, reader, writer):
        """
        Open new connection and create client
        
        :param reader: socket stream reader
        :param writer: socket stream writer
        :return: 
        """
        address = writer.get_extra_info('peername')
        ip = socket.gethostbyname(address[0])
        if ip in self.white_list:
            if ip in self._clients.keys():
                client = self._clients[ip]
            else:
                client = SocketClient(address, self._handler_functions, self._storage_dir)
                self._clients[ip] = client
            if not client.connected():
                yield from client.wait_for_disconnect()
                client.start(reader, writer, True)
            else:
                logging.error("host %s already connected" % ip)
                writer.close()
        else:
            writer.close()

    def terminate(self):
        """
        Terminate server and all its clients
        """
        if not self.terminated:
            self.terminated = True
            self._server.close()
            while len(self._clients) > 0:
                ip, client = self._clients.popitem()
                del client

    def __del__(self):
        self.terminate()

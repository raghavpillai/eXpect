import asyncio
import logging
import os
import random
import string
import threading
import time

from socketio.server import SocketServer
from socketio.client import SocketClient


class PerformanceTest:

    def __init__(self):
        self.terminate = False
        self._server = None
        self._socket_client = None
        self.received_messages = 0
        self.sended_messages = 0
        self.conditions = []
        self.cps = {"miatel": 7, "comlink": 7, "spacetel": 7}
        operators = {"miatel": 14, "comlink": 10, "spacetel": 4}
        self.resources = {}
        self.call_delays = {}
        self.last_call_at = {}
        self.call_locks = {}
        for key, value in self.cps.items():
            self.call_delays[key] = 1.0 / float(value)
            self.last_call_at[key] = time.time()
            self.call_locks[key] = asyncio.Lock()
        i = 0
        k = 0
        while i < 15:
            i += 1
            for operator, cnt in operators.items():
                j = 0
                while j < cnt:
                    j += 1
                    k += 1
                    self.resources[k] = {"conditions": [], "is_busy": 0, "cs": threading.Lock(), "operator": operator}
        self.timings = []

    @asyncio.coroutine
    def run(self):
        while not self.terminate:
            yield from asyncio.sleep(1)

    def create_server(self):
        loop = asyncio.get_event_loop()
        path = os.path.dirname(os.path.abspath(__file__))
        self._server = SocketServer({"test": self.test_server, "test_waiting": self.test_waiting}, path + '/configs/socket_server.ini')
        loop.run_until_complete(self.run())

    def create_client(self):
        loop = asyncio.get_event_loop()
        self._socket_client = SocketClient(["127.0.0.1", "54445"],
                                           {"test": self.test_client, "action1": self.action1})
        loop.create_task(self._socket_client.connector())
        loop.run_until_complete(self.run())

    def take_resource(self):
        timed_out = False
        message_showed = False
        time_out = 300
        while not timed_out:
            for resource_id, resource in self.resources.items():
                resource["cs"].acquire()
                if not resource["is_busy"]:
                    resource["is_busy"] = 1
                    resource["cs"].release()
                    return resource_id, resource["operator"]
                resource["cs"].release()
            if not message_showed:
                print("all resources as busy, wait")
                message_showed = True
            condition = threading.Condition()
            with condition:
                self.conditions.append(condition)
                timed_out = not condition.wait(time_out)
        raise Exception("failed to take resource")

    def release_resource(self, resource_id):
        resource = self.resources[resource_id]
        resource["is_busy"] = 0
        if len(self.conditions) > 0:
            condition = self.conditions.pop(0)
            with condition:
                condition.notify()
        resource["conditions"] = []

    def sending_as_client(self, message, count=1, length=16, timeout=0.1, with_wait=False):
        if self._socket_client is not None:
            counter = 0
            while counter < count:
                counter += 1
                self.sended_messages += 1
                if with_wait:
                    print("start waiting for response")
                    time1 = time.time()
                    self._socket_client.append_message({"action": "test_waiting", "test": message, "time": time.time()}, True)
                    print("waiting response time: %f" % (time.time() - time1))
                    time.sleep(timeout)
                else:
                    resource_id, operator = self.take_resource()
                    self._socket_client.append_message({"action": "test", "test": message, "time": time.time(),
                                                        "resource_id": resource_id, "operator": operator})
                    time.sleep(timeout)
        else:
            print("ERROR! no client exists!")

    def server_worker(self, message):
        repeat_cnt = random.choice([0, 1, 2, 3])
        i = 0
        while i < repeat_cnt:
            i += 1
            sleep_time = random.choice([1, 2, 0, 1, 1, 4, 1, 3, 2, 5, 10])
            time.sleep(sleep_time)
            self._server.broadcast_message({"action": "action1", "test": message["test"]})
        sleep_time = random.choice([1, 2, 0, 1, 1, 4, 1, 3, 2, 5])
        time.sleep(sleep_time)
        self._server.broadcast_message(message)

    @asyncio.coroutine
    def test_server(self, message):
        print("receiving time: %f" % (time.time() - message["time"]))
        self.timings.append(time.time() - message["time"])
        self.received_messages += 1
        with (yield from self.call_locks[message["operator"]]):
            current_delay = time.time() - self.last_call_at[message["operator"]]
            if current_delay < self.call_delays[message["operator"]]:
                yield from asyncio.sleep(self.call_delays[message["operator"]] - current_delay)
            self.last_call_at[message["operator"]] = time.time()
        worker_thread = threading.Thread(target=self.server_worker,
                                         args=(message,))
        worker_thread.daemon = True
        worker_thread.start()

    @asyncio.coroutine
    def test_waiting(self, message):
        print("receive waiting time: %f" % (time.time() - message["time"]))
        self.timings.append(time.time() - message["time"])
        self.received_messages += 1
        time.sleep(5)
        return {"action": "test_waiting", "response": "success"}

    @asyncio.coroutine
    def test_client(self, message):
        self.timings.append(time.time() - message["time"])
        self.received_messages += 1
        self.release_resource(message["resource_id"])

    @asyncio.coroutine
    def action1(self, message):
        action_tread = threading.Thread(target=self._action_worker)
        action_tread.daemon = True
        action_tread.start()

    def _action_worker(self):
        sleep_time = random.choice([1, 2, 0, 1, 1, 4, 12, 8, 3, 5])
        time.sleep(sleep_time)

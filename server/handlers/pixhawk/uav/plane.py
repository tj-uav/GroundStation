"""
This is decigned to subclass Dronekit's Vehicle class, to allow for extra values to be collected
This is not currently implemented into the code, as the Pixhawk is not yet configured to send
these values
However, this code is kept in the repository for future use and maintenance purposes
"""
from dronekit import Vehicle


class Temperature:
    def __init__(self, left_motor=None, left_esc=None, right_motor=None, right_esc=None):
        self.left_motor = left_motor
        self.left_esc = left_esc
        self.right_motor = right_motor
        self.right_esc = right_esc

    def __str__(self):
        return f"Temperature: left_motor={self.left_motor},left_esc={self.left_esc},right_motor=" \
               f"{self.right_motor},right_esc={self.right_esc} "


class Battery:
    def __init__(self, left=None, right=None):
        self.left = left
        self.right = right

    def __str__(self):
        return f"Battery: left={self.left},right={self.right}"


class Plane(Vehicle):
    def __init__(self, *args):
        super().__init__(*args)

        self._temperature = Temperature()
        self._battery = Battery()

        @self.on_message("TEMPERATURE")
        def temperature_listener(self, _, message):
            self._temperature.left_motor = message.left_motor
            self._temperature.left_esc = message.left_esc
            self._temperature.right_motor = message.right_motor
            self._temperature.right_esc = message.right_esc

            self.notify_attribute_listeners("temperature", self._temperature)

        @self.on_message("BATTERY")
        def battery_listener(self, _, message):
            self._battery.left = message.left
            self._battery.right = message.right

            self.notify_attribute_listeners("battery", self._battery)

    @property
    def temperature(self):
        return self._temperature

    @property
    def battery(self):
        return self._battery

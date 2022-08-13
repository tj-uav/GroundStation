import functools
import inspect
from functools import wraps
from logging import Logger
from typing import Callable

from dronekit import Vehicle

from errors import InvalidStateError

log_exempt = (
    "update",
    "stats",
    "quick",
    "get_armed",
    "submit_telemetry",
    "odlc_get_queue",
    "odlc_add_to_queue",
    "process_image",
)


def log(func: Callable, logger: Logger) -> Callable:
    @wraps(func)
    def wrapper(*args, **kwargs):
        res = None
        try:
            res = func(*args, **kwargs)
        finally:
            class_ = get_class_that_defined_method(func)
            if str(class_).count("'") >= 1:
                class_ = str(class_).split("'")[1]
            aargs = ", ".join(repr(x) for x in args[1:])
            kkwargs = ", ".join(f"{k}={v}" for k, v in kwargs.items())
            all_args = aargs + ", " + kkwargs if (aargs and kkwargs) else aargs + kkwargs
            logger.debug(
                "{:<60}".format(f"{class_}.{func.__name__}({all_args})") + f"  -->  {res}"
            )
        return res

    return wrapper


def decorate_all_functions(function_decorator, *args, **kwargs):
    def decorator(cls):
        for name, obj in vars(cls).items():
            if callable(obj) and obj.__name__ not in log_exempt:
                setattr(cls, name, function_decorator(obj, *args, **kwargs))
        return cls

    return decorator


def wait_for_param_load(f: Callable):
    def wrapper(*args, **kwargs):
        try:
            args[0].vehicle.wait_ready("parameters")
            return f(*args, **kwargs)
        except TimeoutError as e:
            raise InvalidStateError(str(e)) from e

    return wrapper


def get_class_that_defined_method(meth):
    if isinstance(meth, functools.partial):
        return get_class_that_defined_method(meth.func)
    if inspect.ismethod(meth) or (
        inspect.isbuiltin(meth)
        and getattr(meth, "__self__", None) is not None
        and getattr(meth.__self__, "__class__", None)
    ):
        for cls in inspect.getmro(meth.__self__.__class__):
            if meth.__name__ in cls.__dict__:
                return cls
        meth = getattr(meth, "__func__", meth)  # fallback to __qualname__ parsing
    if inspect.isfunction(meth):
        cls = getattr(
            inspect.getmodule(meth),
            meth.__qualname__.split(".<locals>", 1)[0].rsplit(".", 1)[0],
            None,
        )
        if isinstance(cls, type):
            return cls
    return getattr(meth, "__objclass__", None)  # handle special descriptor objects

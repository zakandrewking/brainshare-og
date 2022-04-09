import logging
import sys

# TODO toggle based on environment
# TODO no debug logging for docker client package
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

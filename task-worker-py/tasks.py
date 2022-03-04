import dramatiq
import logging

@dramatiq.actor()
def first_task():
    logging.info('test') # TODO confirm that this log is collected
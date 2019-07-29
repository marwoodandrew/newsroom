#!/usr/bin/env python

from flask_script import Manager
from newsroom import Newsroom
from superdesk import get_resource_service
from newsroom.elastic_utils import rebuild_elastic_index
from newsroom.mongo_utils import index_elastic_from_mongo, index_elastic_from_mongo_from_timestamp
from newsroom.auth import get_user_by_email
from newsroom.company_expiry_alerts import CompanyExpiryAlerts
import content_api

app = Newsroom()
manager = Manager(app)


@manager.command
def create_user(email, password, first_name, last_name, is_admin):
    new_user = {
        'email': email,
        'password': password,
        'first_name': first_name,
        'last_name': last_name,
        'email': email,
        'user_type': 'administrator' if is_admin else 'public',
        'is_enabled': True,
        'is_approved': True
    }

    with app.test_request_context('/users', method='POST'):

        user = get_user_by_email(email)

        if user:
            print('user already exists %s' % str(new_user))
        else:
            print('creating user %s' % str(new_user))
            get_resource_service('users').post([new_user])
            print('user saved %s' % (new_user))

        return new_user


@manager.command
def elastic_rebuild():
    rebuild_elastic_index()


@manager.command
def elastic_init():
    app.data.init_elastic(app)


@manager.option('-h', '--hours', dest='hours', default=None)
@manager.option('-c', '--collection', dest='collection', default=None)
@manager.option('-t', '--timestamp', dest='timestamp', default=None)
@manager.option('-d', '--direction', dest='direction', choices=['older', 'newer'], default='older')
def index_from_mongo(hours, collection, timestamp, direction):
    print('Checking if elastic index exists, a new one will be created if not')
    app.data.init_elastic(app)
    print('Elastic index check has been completed')

    if timestamp:
        index_elastic_from_mongo_from_timestamp(collection, timestamp, direction)
    else:
        index_elastic_from_mongo(hours=hours, collection=collection)


@manager.command
def content_reset():
    app.data.remove('items')
    app.data.remove('items_versions')


@manager.command
def send_company_expiry_alerts():
    CompanyExpiryAlerts().send_alerts()


@manager.option('-m', '--expiry', dest='expiry_days', required=False)
def remove_expired(expiry_days):
    exp = content_api.RemoveExpiredItems()
    exp.run(expiry_days)


if __name__ == "__main__":
    manager.run()

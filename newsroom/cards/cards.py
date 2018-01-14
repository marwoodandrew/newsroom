import newsroom


class CardsResource(newsroom.Resource):
    """
    Cards schema
    """
    schema = {
        'label': {
            'type': 'string',
            'unique': True,
            'required': True
        },
        'type': {
            'type': 'string',
            'required': True,
            'nullable': False,
            'allowed': ['6-text-only', '4-picture-text'],
        },
        'config': {
            'type': 'dict',
        },
        'order': {
            'type': 'integer',
            'nullable': True
        }
    }
    datasource = {
        'source': 'cards',
        'default_sort': [('order', 1), ('label', 1)]
    }
    item_methods = ['GET', 'PATCH', 'DELETE']
    resource_methods = ['GET', 'POST']


class CardsService(newsroom.Service):
    pass

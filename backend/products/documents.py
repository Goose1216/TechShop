from django_opensearch_dsl import Document, fields
from django_opensearch_dsl.registries import registry
from opensearchpy import analyzer

from .models import Product, Category, Brand

russian_analyzer = analyzer(
    'russian',
    tokenizer="standard",
    filter=["lowercase"]
)

@registry.register_document
class CategoryDocument(Document):
    class Index:
        name = 'category'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'russian': {
                        'type': 'custom',
                        'tokenizer': 'standard',
                        'filter': ['lowercase']
                    }
                }
            }
        }

    class Django:
        model = Category
        fields = ['name']

@registry.register_document
class BrandDocument(Document):
    class Index:
        name = 'brand'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'russian': {
                        'type': 'custom',
                        'tokenizer': 'standard',
                        'filter': ['lowercase']
                    }
                }
            }
        }

    class Django:
        model = Brand
        fields = ['name']

@registry.register_document
class ProductDocument(Document):
    class Index:
        name = 'products'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'russian': {
                        'type': 'custom',
                        'tokenizer': 'standard',
                        'filter': ['lowercase']
                    }
                }
            }
        }

    class Django:
        model = Product
        fields = {
            'name': fields.TextField(analyzer=russian_analyzer),
        }
        related_models = [Category, Brand]

    def get_instances_from_related(self, related_instance):
        model = self.django.model
        if isinstance(related_instance, Category):
            return model.objects.filter(category=related_instance)
        if isinstance(related_instance, Brand):
            return model.objects.filter(brand=related_instance)
        return super().get_instances_from_related(related_instance)

    category = fields.ObjectField(properties={
        'name': fields.TextField(),
    })

    brand = fields.ObjectField(properties={
        'name': fields.TextField(),
    })
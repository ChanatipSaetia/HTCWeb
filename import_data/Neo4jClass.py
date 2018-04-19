from neomodel import StructuredNode, StringProperty, RelationshipTo, RelationshipFrom, config, IntegerProperty,UniqueIdProperty, BooleanProperty

config.DATABASE_URL = 'bolt://neo4j:neo@neo4j:7687'
class Class(StructuredNode):
    uid = UniqueIdProperty()
    index = IntegerProperty(index=True)
    name = StringProperty(index=True)
    documents = IntegerProperty(index=True)
    features = IntegerProperty(index=True)
    leaf = BooleanProperty()
    level = IntegerProperty()
    assigned = RelationshipTo('Document', 'ASSIGNED TO')
    have = RelationshipFrom('Level', 'HAVE')
    parent = RelationshipFrom('Class', 'PARENT OF')
    child = RelationshipTo('Class', 'PARENT OF')
    dataset = StringProperty()

class Feature(StructuredNode):
    uid = UniqueIdProperty()
    name = StringProperty(index=True)
    documents = IntegerProperty(index=True)
    classes = IntegerProperty(index=True)
    stored = RelationshipTo('Document', 'HAVE')
    dataset = StringProperty()
    of = RelationshipFrom('Dataset', 'HAVE')

class Document(StructuredNode):
    uid = UniqueIdProperty()
    index = IntegerProperty(index=True)
    have = RelationshipTo('Feature', 'HAVE')
    belong = RelationshipFrom('Class', 'ASSIGNED TO')
    dataset = StringProperty()
    
class Dataset(StructuredNode):
    name = StringProperty(unique_index=True)
    document = IntegerProperty()
    classes = IntegerProperty()
    levels = IntegerProperty()
    features = IntegerProperty()
    c = RelationshipTo('Class', 'HAVE')
    l = RelationshipTo('Level', 'HAVE')
    d = RelationshipTo('Document', 'HAVE')
    f = RelationshipTo('Feature', 'HAVE')
    
    status = StringProperty()
    percentage = IntegerProperty()

class Level(StructuredNode):
    uid = UniqueIdProperty()
    level = IntegerProperty(index=True)
    classes = IntegerProperty()
    leaf = IntegerProperty()
    documents = IntegerProperty()
    dataset = StringProperty()
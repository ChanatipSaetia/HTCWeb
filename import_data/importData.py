
# coding: utf-8

# In[1]:


import hierarchy as hie
import preparation as prep
from Dataset import Dataset
from collections import defaultdict, Counter
from Neo4jClass import Dataset as Neo4jDataset
from Neo4jClass import Class, Feature, Level
import numpy as np
import os


# In[2]:


all_dataset = []
real_list = []


# In[3]:

for i in os.listdir('data/'):
    if(i != '.DS_Store'):
        if not Neo4jDataset.nodes.get_or_none(name=i):
            d = Neo4jDataset(name=i, status="waiting").save()
            real_list.append(i)
            all_dataset.append(d)

print("List of waiting datasets:")
print("\n".join(real_list))
print()

# # Each Import

# In[4]:


for name in real_list:
    neo_dataset = Neo4jDataset.nodes.get_or_none(name=name)
    neo_dataset.status = "processing"
    neo_dataset.save()
    dataset = Dataset(name, sequence=True)
    number_doc_each_class = np.array(dataset.number_of_data_in_each_class())

    document = dataset.number_of_data()
    classes = dataset.number_of_classes()
    levels = dataset.number_of_level()
    features = dataset.number_of_feature()

    class_in_level = []
    leaf_class = []
    doc_in_level = []
    for i in range(levels):
        class_in_level.append(dataset.number_of_class_in_each_level(i))
        leaf_class.append(dataset.number_of_class_in_each_level(i) - dataset.number_of_parent_classes(i))
        doc_in_level.append(np.sum(number_doc_each_class[dataset.level[i]:dataset.level[i+1]][np.logical_not(dataset.filter_parent(i))]))

    df = defaultdict(int)
    dc = defaultdict(int)
    cf = defaultdict(set)
    fc = defaultdict(set)
    for data, label in zip(dataset.datas, dataset.labels):
        first_feature = True
        for l in label[0].indices:
            dc[l] += 1
            for f in data:
                fc[l].add(f)
                cf[f].add(l)
                if first_feature:
                    df[f] += 1
            first_feature = False

    fc = {i:len(fc[i]) for i in fc}
    cl = []
    for i in range(levels):
        cl += [i] * (dataset.level[i+1] - dataset.level[i])
    cf = {i:len(cf[i]) for i in cf}

    count = 0
    all_number = levels + document + classes

    neo_dataset.status = "storing"
    neo_dataset.save()

    neo_dataset.document = document
    neo_dataset.classes = classes
    neo_dataset.levels = levels
    neo_dataset.features = features
    neo_dataset.percentage = (count / all_number) * 100
    neo_dataset.save()

    level_object = []
    for i in range(levels):
        c = dataset.number_of_class_in_each_level(i)
        ll = dataset.number_of_class_in_each_level(i) - dataset.number_of_parent_classes(i)
        dd = np.sum(number_doc_each_class[dataset.level[i]:dataset.level[i+1]][np.logical_not(dataset.filter_parent(i))])
        l = Level(level=i, classes=c, leaf=ll, documents=dd, dataset=name).save()
        level_object.append(l)
        count += 1
        neo_dataset.percentage = (count / all_number) * 100
        neo_dataset.save()

    class_object = []
    root = Class(index=-1, name='root', documents=document, features=features, leaf=False, dataset=name, level=0).save()
    for i,n in enumerate(dataset.all_name):
        l = level_object[cl[i]]
        if i in fc:
            ffc = fc[i]
        else:
            ffc = 0
        leaf = not dataset.not_leaf_node[i]
        c = Class(index=i, name=n, documents=dc[i], features=ffc, leaf=leaf, dataset=name, level=cl[i] + 1).save()
        c.have.connect(l)
        if cl[i] == 0:
            c.parent.connect(root)
        if i in dataset.parent_of:
            for parent in dataset.parent_of[i]:
                c.parent.connect(class_object[parent])
        class_object.append(c)
        count += 1
        neo_dataset.percentage = (count / all_number) * 100
        neo_dataset.save()

    feature_object = {}
    for i, s in enumerate(zip(dataset.datas, dataset.labels)):
        d, label = s
        for f in d:
            if not f in feature_object:
                feature_object[f] = Feature(name=f, documents=df[f], classes=cf[f], dataset=name).save()
        count += 1
        neo_dataset.percentage = (count / all_number) * 100
        neo_dataset.save()

    neo_dataset.status = "ready"
    neo_dataset.save()
    print("Finish " + name + " dataset")


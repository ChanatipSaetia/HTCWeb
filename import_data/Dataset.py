import os
import pickle
from functools import reduce

import numpy as np
from scipy.sparse import csr_matrix

import hierarchy as hie
import preparation as prep
from exception import NotEmbeddingState
from collections import Counter


class Dataset():

    def __init__(self, data_name, sequence=False):
        self.data_name = data_name
        self.data_type = "index"
        self.sequence = sequence
        self.load_hierarchy()
        self.load_datas()
        # sparse data

    def load_hierarchy(self):
        if not os.path.isfile("data/%s/hierarchy.pickle" % self.data_name):
            hierarchy, parent_of, all_name, name_to_index, level = hie.reindex_hierarchy(
                '%s/hierarchy.txt' % self.data_name)
            hie.save_hierarchy("%s/hierarchy.pickle" % self.data_name, hierarchy,
                               parent_of, all_name, name_to_index, level)
        self.hierarchy, self.parent_of, self.all_name, self.name_to_index, self.level = hie.load_hierarchy(
            "%s/hierarchy.pickle" % self.data_name)
        self.not_leaf_node = np.array([i in list(
            self.hierarchy.keys()) for i in range(self.number_of_classes())])

    def load_datas(self):
        if not os.path.isfile("data/%s/data.pickle" %
                              (self.data_name)):
            file_name = "%s/data.txt" % (self.data_name)
            datas, labels = prep.import_data(file_name, sequence=self.sequence)
            hierarchy_file_name = "%s/hierarchy.pickle" % self.data_name
            labels = prep.map_index_of_label(
                hierarchy_file_name, labels)
            indice = [j for i in labels for j in i]
            indptr = np.cumsum([0] + [len(i) for i in labels])
            data_one = np.ones(len(indice))
            labels = csr_matrix((data_one, indice, indptr),
                                shape=(len(labels), len(self.all_name)))

            save_file_name = "%s/data.pickle" % (self.data_name)
            prep.save_data_in_pickle(save_file_name, datas, labels)
        self.datas, self.labels = prep.load_data_in_pickle(
            "%s/data.pickle" % (self.data_name))
        self.features = Counter([j for i in self.datas for j in i])

    def number_of_level(self):
        return len(self.level) - 1

    def number_of_classes(self):
        return self.level[-1]

    def number_of_parent_classes(self, level):
        return int(np.sum(self.filter_parent(level)))

    def filter_parent(self, level):
        return self.not_leaf_node[self.level[level]:self.level[level + 1]]

    def number_of_class_in_each_level(self, level):
        return int(self.level[level + 1] - self.level[level])

    def number_of_data_in_each_class(self):
        return np.sum(self.labels, 0).astype(int).tolist()[0]

    def number_of_data(self):
        return len(self.datas)

    def index_of_level(self, level):
        return self.level[level], self.level[level + 1]

    def number_of_feature(self):
        return len(self.features)

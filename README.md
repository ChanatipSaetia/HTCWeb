# Visualization of Hierarchical Text Classification (HTC)

## Requirement
* [Docker](https://docs.docker.com/install/)
* [Docker compose](https://docs.docker.com/compose/install/#install-compose)

## System based on
* Node.js
* Neo4j
* Python

## Installation
1. Store dataset and hierarchical structure(if the task is hierarchical classification) in the /import_data/data in the following format
~~~~
import_data/
    data/
        <your_dataset_name>/
            data.txt
            hierarchy.txt
~~~~
Example
~~~~
import_data/
    data/
        wipo_d/
            data.txt
            hierarchy.txt
~~~~
2. Run `docker-compose up`
3. Visualization can accessed in `localhost:3000`

## Description
* Homepage - This page shows all datasets in the database. There are a import status of each dataset, explore button and delete button in each panel of each dataset.
 ![alt text](/docs_image/Homepage.png)

* Summary – This page shows common details of the chosen dataset which is the number of documents, the number of unique words, the number of categories and the number of levels of categories. Moreover, there are frequency histograms of each data. This page intend to give the overview information of the chosen dataset.
 ![alt text](/docs_image/Index.png)

* Hierarchy – This page shows a hierarchy of the chosen dataset . Each node of the graph represents a category which displays its name and when each node is hovered, the number of documents that belong to that category will be shown. Edges of the graph represent a parent relation where a left node is parent and a right node is child where its line size represent the ratio of the number of documents in a child node to the number of documents in a parent node. This page helps people who use Local classifier per parent node to know the number of subcategories of each category and the number of documents in each node which can help to identify imbalance problem of each node.
 ![alt text](/docs_image/Hierarchy.png)

* Level – This page shows information of each level which is the number of categories, the number of leaf categories and the number of documents of leaf categories. This information is very helpful for developing Local classifier per level because it help to identify how important of each level.
 ![alt text](/docs_image/Level.png)

* Documents x Classes – Histogram of frequency of documents of each classes is presented in this page where the user can choose only categories of which the number of documents is sufficient. The settings of this page is told below.
    * The X scale can be switch between a normal scale and a log scale
    * The range of the number of documents can be changed from a first slider. A second slider can change the number of bins in the graph.
    * Classes inside and outside a specific range can be download in CSV format. 
    * When each X position is hovered, The number of classes of which the number of documents is higher and lower than the specific x value is shown.
    ![alt text](/docs_image/DocXClass.png)

* Features x Classes – This page is similar to Documents x Classes but change from the number of documents to the number of features or words.
 ![alt text](/docs_image/FeatureXClass.png)

* Documents x Features –  This page is similar to Documents x Classes which help for feature selection. The number of common words or rare words can be known immediately and can be selected for export to CSV file.
 ![alt text](/docs_image/DocXFeature.png)

* Classes x Features – This page is similar to Documents x Classes which helps to consider which features are important for classification. If a feature is in a few classes, this feature may be a important feature.
 ![alt text](/docs_image/ClassXFeature.png)


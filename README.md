# Visualization of Hierarchical Text Classification (HTC)

## Requirement
* [Docker](https://docs.docker.com/install/)
* [Docker compose](https://docs.docker.com/compose/install/#install-compose)

## System based on
* Node.js
* Neo4j
* Python

## Installation
1. Store dataset and hierarchical structure(if the task is hierarchical classification) in the /data in the following format
~~~~
data/
    <your_dataset_name>/
        data.txt
        hierarchy.txt
~~~~
Example
~~~~
data/
    wipo_d/
        data.txt
        hierarchy.txt
~~~~
2. Run `docker-compose up`
3. Visualization can accessed in `localhost:3000`

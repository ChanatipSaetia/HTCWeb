FROM python:3

RUN mkdir -p /import

WORKDIR /import

RUN pip install neomodel numpy scipy

ADD . .

RUN ["chmod", "+x", "wait-for-it.sh"]

CMD [ "./wait-for-it.sh",  "neo4j:7687", "--", "python", "importData.py" ]
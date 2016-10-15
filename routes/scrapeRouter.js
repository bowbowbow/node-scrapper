// node defalut module
const fs = require('fs');
const request = require('request');
const scrape = require('html-metadata');
const redis = require('redis');


const client1 = redis.createClient({
  host: 'localhost',
  port: 6380,
});
const client2 = redis.createClient({
  host: 'localhost',
  port: 6381,
});

const ConsistentHashing = require('consistent-hashing');
const cons = new ConsistentHashing(["client1", "client2"]);


exports.route = (app) => {
  app.get('/scrape', (req, res) => {
    const url = req.query.url;

    if(!url) {
      res.status(400).end('invalid url');
      return;
    }

    const node =  cons.getNode(url);
    console.log(node);

    let redisClient = '';
    if(node === 'client1') {
      redisClient = client1;
    } else {
      redisClient = client2;
    }

    redisClient.get(url, (err, reply) => {
      if(err) {
        res.status(400).end('redis error');
        return;
      }
      if (!reply) {
        scrape(url, (err, metadata) => {
          if(err) {
            log.notice(`NOT FOUND :: ${url}`);
            res.end('page not found');
            return;
          }
          const openGraph = metadata.openGraph;

          res.json(openGraph);
          if (openGraph) {
            log.notice(`SUCCESS :: ${url}`);
            redisClient.set(url, JSON.stringify(openGraph));
          } else {
            log.notice(`FAIL :: ${url}`);
          }
        });
      } else {
        log.notice(`SUCCESS :: ${url} CASHE HIT!`);
        res.json(JSON.parse(reply));
      }
    });

  });
}












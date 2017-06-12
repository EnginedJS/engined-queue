# engined-queue

Queue agent service for engined, which is based on `engined-amqp`.

[![NPM](https://nodei.co/npm/engined-queue.png)](https://nodei.co/npm/engined-queue/)

## Installation

`engined-queue` is based on `engined-amqp`, so you must install `engined-amqp` as well.

Install via NPM:

```shell
npm install engined-amqp engined-queue
```

## Usage

Starting `engined-amqp` service before queue agent service in engined, see example below:

```javascript
const { Manager } = require('engined');
const AMQPService = require('engined-amqp');
const { QueueService } = require('engined-queue');

const main = async () => {

	// Create manager
	let serviceManager = new Manager({ verbose: true });

	// Adding agent to manager
	serviceManager.add('AMQP', AMQPService);
	serviceManager.add('Queue', QueueService({ uri: 'amqp://localhost/myvhost' }));

	// Start all services
	await serviceManager.startAll();
};

main();
```

## Implement Consumer

For consuming messages, inherit `Consumer` class to implement a service and implement `consume` method.

```javascript
const { Consumer } = require('engined-queue');

const PrototypeConsumer = Consumer({
	exchangeName: 'myexcahnge',
	exchangeType: 'topic', // optional: default to topic if not set.
	targetQueue: 'myqueue',
	routingRules: 'black.*'
});

const MyConsumer = class extends PrototypeConsumer {
	consume(routingKey, msg) {
		// do something ...

		// done & ack.
		return true;
	}
}

// Add to service manager
serviceManager.add('MyConsumer', MyConsumer);
```

## License
Licensed under the MIT License
 
## Authors
Copyright(c) 2017 Fred Chien（錢逢祥） <<cfsghost@gmail.com>>

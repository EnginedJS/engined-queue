const { Service } = require('engined');

module.exports = (opts) => class extends Service {

	constructor(context) {
		super(context);

		this.consumerTag = null;
		this.agentName = opts.agentName || 'default';
		this.targetQueue = opts.targetQueue || null;
		this.exchangeName = opts.exchangeName || null;
		this.exchangeType = opts.exchangeType || 'topic';
		this.routingRules = opts.routingRules || null;
	}

	async init() {
		let inputQueue = this.targetQueue;
		let exName = this.exchangeName;
		let channel = await this.getContext().get('Queue').getAgent(this.agentName).getChannel();

		// Initializing queue and binding
		let q = await channel.assertQueue(inputQueue);

		if (exName !== null) {
			// Initializing exchange
			await channel.assertExchange(exName, this.exchangeType, { durable: false });
			await channel.bindQueue(q.queue, exName, this.routingRules);
		}

		// Waiting for tasks
		let ret = await channel.consume(inputQueue, async (rawMsg) => {

			try {
				// Consume
				let ret = await this.consume(rawMsg.fields.routingKey, rawMsg.content, rawMsg);

				if (ret) {
					channel.ack(rawMsg);
				}
			} catch(e) {
				console.log(e);
			}

		}, { noAck: false });

		this.consumerTag = ret.consumerTag;
	}

	async consume(routingKey, content) {
		console.log('Not implemented');
	}

	async start() {

		let agent = this.getContext().get('Queue').getAgent(this.agentName);

		agent.on('connected', async () => {
			// Reinitialize if agent did reconnect
			await this.init();
		});

		if (agent.isConnected())
			await this.init();
	}

	async stop() {

		if (this.consumerTag === null)
			return;

		const agent = await this.getContext().get('Queue').getAgent(this.agentName);

		const channel = await agent.getChannel();

		await channel.cancel(this.consumerTag);

		this.consumerTag = null;
	}
};

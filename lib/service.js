const { Service } = require('engined');

module.exports = (opts = {}) => class extends Service {

	constructor(context) {
		super(context);

		this.agent = null;
		this.agentName = opts.agentName || 'default';
		this.uri = opts.uri;
	}

	async start() {

		// Using AMQP
		let amqp = this.getContext().get('AMQP');

		// Create agent
		let agent = this.agent = await amqp.createAgent(this.agentName);

		// Connect
		await agent.connect(opts.uri);

		let context = this.getContext().get('Queue');
		if (!context) {
			context = {};
			this.getContext().set('Queue', context);
		}

		// Add agent
		context[this.agentName] = agent;
	}

	async stop() {

		if (this.agent === null)
			return;

		let context = this.getContext().get('Queue');
		if (!context) {
			return;
		}

		// Release agent
		amqp.releaseAgent(this.agent);

		// Take off agent from context
		delete context[this.agentName];

		if (Object.keys(context).length === 0)
			this.getContext().set('Queue', undefined);
	}
}

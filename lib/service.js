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

		this.getContext().assert('Queue').register(this.agentName, agent);;
	}

	async stop() {

		if (this.agent === null)
			return;

		let agentManager = this.getContext().get('Queue');
		if (!agentManager)
			return;

		agentManager.unregister(this.agentName);

		if (agentManager.count() === 0) {
			this.getContext().remove('Queue');
		}
	}
}

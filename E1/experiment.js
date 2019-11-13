constants = {
    INSTRUCTIONS = 'materials/instructions.json',
    CONDITION_FIXED = 'fixed',
    CONDITION_METTLER = 'mettler',
    CONDITION_MEMORIZE = 'memorize'
}

class Experiment {
    constructor() {
        this.workerid = null;
        this.instructions = null;
        this.condition = null;

        /* MTurk */
        this.turkInfo = jsPsych.turk.turkInfo();
		this.workerId = this.turkInfo.outsideTurk ? String(Math.floor(Math.random() * (10000 - 1000) + 1000)) : this.turkInfo.workerId;
        Math.seedrandom(this.workerId);
        
        /* Determine which condition to use */
        const condRand = Math.random();
		if (!condition) {
			var conditions = [constants.CONDITION_FIXED, constants.CONDITION_METTLER, constants.CONDITION_MEMORIZE];
			this.condition = conditions[Math.floor(condRand * conditions.length)];
        }
        
        console.log('Worker ID', this.workerId);
        console.log(this.condition);
    }
}
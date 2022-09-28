class Metrics {
    constructor(addedCount, updatedCount, deletedCount) {
        this.addedCount = addedCount;
        this.updatedCount = updatedCount;
        this.deletedCount = deletedCount;
    }

    static added(count = 1) {
        return new Metrics(count, 0, 0);
    }

    static updated(count = 1) {
        return new Metrics(0, count, 0);
    }

    static deleted(count = 1) {
        return new Metrics(0, 0, count);
    }

    static zero() {
        return new Metrics(0, 0, 0);
    }

    /**
     * /!\ Mutable implementation
     * @param {Metrics} other: Metrics instance to add to 'this'.
     */
    merge(other) {
        this.addedCount += other.addedCount;
        this.updatedCount += other.updatedCount;
        this.deletedCount += other.deletedCount;
    }
}

module.exports = {
    Metrics,
}

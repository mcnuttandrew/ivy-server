export const fetch = (db: any, collectionName: string, query: any, limit: number | null) => {
    const collection = db.collection(collectionName);
    return new Promise((resolve, reject) => {
        const cursor = collection.find(query);
        const cb = (err: Error, result: any) => (err ? reject(err) : resolve(result));
        if (limit) {
            cursor.limit(limit || 1).toArray(cb);
            return;
        }
        cursor.toArray(cb);
    });
};
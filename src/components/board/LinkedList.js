
class LinkedListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

export class LinkedList {
    constructor(value) {
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;
    }

    insertAtTail(value) {
        const newTail = new LinkedListNode(value);
        const currentTail = this.tail;
        this.tail = newTail;
        this.tail.next = currentTail;
    }

    insertAtHead(value) {
        const node = new LinkedListNode(value);
        const currentHead = this.head;
        this.head = node;
        currentHead.next = this.head;
    }
}
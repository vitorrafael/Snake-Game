
class LinkedListNode {
    public value: number;
    public next: LinkedListNode | null;

    constructor(value: number) {
        this.value = value;
        this.next = null;
    }
}

export class LinkedList {
    public head: LinkedListNode;
    public tail: LinkedListNode;

    constructor(value: number) {
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;
    }

    insertAtTail(value: number) {
        const newTail = new LinkedListNode(value);
        const currentTail = this.tail;
        this.tail = newTail;
        this.tail.next = currentTail;
    }

    insertAtHead(value: number) {
        const node = new LinkedListNode(value);
        const currentHead = this.head;
        this.head = node;
        currentHead.next = this.head;
    }
}
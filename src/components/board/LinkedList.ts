export class LinkedListNode<Type> {
    public value: Type;
    public next: LinkedListNode<Type> | null;

    constructor(value: Type) {
        this.value = value;
        this.next = null;
    }
}

export class LinkedList<Type> {
    public head: LinkedListNode<Type>;
    public tail: LinkedListNode<Type>;

    constructor(value: Type) {
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;
    }

    insertAtTail(value: Type) {
        const newTail = new LinkedListNode(value);
        const currentTail = this.tail;
        this.tail = newTail;
        this.tail.next = currentTail;
    }

    insertAtHead(value: Type) {
        const node = new LinkedListNode(value);
        const currentHead = this.head;
        this.head = node;
        currentHead.next = this.head;
    }
}
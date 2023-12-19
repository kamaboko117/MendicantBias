export default class VideoDetails {
    public id: string;
    public title: string;
    public length: number;
    constructor(id: string, title: string, length: number) {
        this.id = id;
        this.title = title;
        this.length = length;
    }
}
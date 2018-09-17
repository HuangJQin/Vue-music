export default class Singer {
  constructor ({id, mid, name}) {
    this.id = id
    this.mid = mid
    this.name = name
    // this.Findex = this.name.substring(0, 1)
    this.avatar = `http://y.gtimg.cn/music/photo_new/T001R150x150M000${mid}.jpg?max_age=2592000`
  }
}

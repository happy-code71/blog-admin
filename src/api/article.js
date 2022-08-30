import request from '@/utils/request'

// 添加文章
export function AddArticle(data) {
    return request({
        url: '/articles/add_article',
        method: 'post',
        data
    })
}
//  获取文章列表
export function GetArticle(query) {
    return request({
        method: 'get',
        url: '/articles/article_list',
        params: query
    })
}
// 获取文章详情
export function GetArticleDetail(id) {
    return request({
        method: 'get',
        url: '/articles/article_detail',
        params: { id }
    })
}
export function ArticleUpdate(data) {
    return request({
        method: 'post',
        url: '/articles/article_update',
        data
    })
}
export function DeleteOneArticle(id) {
    return request({
        method: 'post',
        url: '/articles/delete_article',
        data: { id }
    })
}
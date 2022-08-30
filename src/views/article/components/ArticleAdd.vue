<template>
    <div class="edit_article">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="标题" prop="title">
                <el-input v-model="ruleForm.title"></el-input>
            </el-form-item>
            <el-form-item label="标签" prop="labels">
                <el-select v-model="ruleForm.labels" multiple filterable allow-create default-first-option
                    placeholder="请选择文章标签">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="简介" prop="edit_article_info">
                <el-input type="textarea" resize="none" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="请输入文章简介"
                    v-model="ruleForm.edit_article_info">
                </el-input>
            </el-form-item>
            <el-form-item label="内容(Markdown编辑器)" prop="edit_article_content">
                <div class="markdown">
                    <div class="markdown_input">
                        <el-input type="textarea" resize="none" :autosize="{ minRows: 30, maxRows: 30 }"
                            placeholder="请输入文章内容" v-model="ruleForm.edit_article_content">
                        </el-input>
                    </div>
                    <div class="markdown_compiled" v-html="compiledMarkdown">
                    </div>
                </div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="update_article('ruleForm')">{{ btmMsg }}</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { Message } from 'element-ui'
import moment from 'moment'
import { AddArticle, GetArticleDetail, ArticleUpdate } from '@/api/article';
import { marked } from 'marked';
export default ({
    name: 'article_add',
    data() {
        return {
            // 是否为更新或者添加
            isUpdate: false,
            options: [{
                value: '前端',
                label: '前端'
            }, {
                value: '后端',
                label: '后端'
            }, {
                value: '其他',
                label: '其他'
            }],
            ruleForm: {
                labels: [],
                title: '',
                edit_article_info: '',
                edit_article_content: '',
            },
            rules: {
                title: [
                    { required: true, message: '请输入标题', trigger: 'blur' },
                    { min: 5, message: '长度大于5 个字符', trigger: 'blur' }
                ],
                labels: [
                    { required: true, message: '请选择标签', trigger: 'change' },
                ],
                edit_article_info: [
                    { required: true, message: '请输入文章简介', trigger: 'blur' },
                    { min: 5, message: '长度大于5 个字符', trigger: 'blur' }
                ],
                edit_article_content: [
                    { required: true, message: '请输入文章内容', trigger: 'blur' },
                ],
            }
        }
    },
    async created() {
        if (this.$route.query.id) {
            this.isUpdate = true
            let id = this.$route.query.id
            let rel = await GetArticleDetail(id)
            this.ruleForm.title = rel.data.title
            this.ruleForm.edit_article_info = rel.data.info
            this.ruleForm.edit_article_content = rel.data.content
            this.ruleForm.labels = rel.data.labels
        }

    },
    computed: {
        compiledMarkdown: function () {
            return marked.parse(this.ruleForm.edit_article_content)
        },
        btmMsg() {
            return this.isUpdate ? '立即更新' : '立即添加'
        }
    },
    methods: {
        update_article: async function () {
            let that = this
            this.$refs['ruleForm'].validate(async function (valid) {
                if (valid) {
                    const data = {
                        author: that.$store.state.user.username,
                        title: that.ruleForm.title,
                        content: that.ruleForm.edit_article_content,
                        info: that.ruleForm.edit_article_info,
                        labels: that.ruleForm.labels,
                        date: moment().format('YYYY-MM-DD HH:mm')
                    }
                    if (that.isUpdate) data['_id'] = that.$route.query.id

                    try {
                        let rel = await (that.isUpdate ? ArticleUpdate(data) : AddArticle(data))
                        console.log(rel)
                        if (rel.data.msg === 'ok') {
                            that.$router.push('/article/table')
                        } else {
                            Message({
                                message: "添加失败",
                                type: 'error',
                                duration: 5 * 1000
                            })
                        }
                    } catch (error) {
                        throw error
                    }
                } else {
                    return false;
                }
            });
        }
    },
})
</script>

<style scoped lang="scss">
.edit_article {
    width: 80%;
    margin: 0 auto;

    .markdown {
        width: 100%;
        display: flex;
        justify-content: space-between;

        >div {
            flex: 1;
            height: 500px;
        }

        .markdown_compiled {
            height: 642px;
            border: 1px solid #DCDFE6;
            background: rgb(245, 245, 245);
            padding: 5px 15px;
            box-sizing: border-box;
            overflow: auto;
            white-space: pre-wrap;
        }
    }
}
</style>
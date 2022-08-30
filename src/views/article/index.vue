<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="searchList.title" :placeholder="$t('table.title')" style="width: 200px;"
                class="filter-item" @keyup.enter.native="handleFilter"
      />
      <el-select v-model="searchList.type" :placeholder="$t('table.type')" clearable class="filter-item"
                 style="width: 130px"
      >
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name"
                   :value="item.display_name"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        {{ $t('table.search') }}
      </el-button>
      <!-- 添加按钮 -->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                 @click="goArticleAdd"
      >
        {{ $t('table.add') }}
      </el-button>

    </div>
    <!-- 自己写一个表格-->
    <el-table :data="list" style="width: 100%" :default-sort="{ prop: 'date', order: 'descending' }"
              @sort-change="sortChange"
    >
      <el-table-column type="index" width="70" label="序号">
      </el-table-column>
      <el-table-column prop="date" label="日期" sortable="custom" width="150">
      </el-table-column>
      <el-table-column prop="author" label="作者" width="100">
      </el-table-column>
      <el-table-column label="标题" min-width="180" max-height="100">
        <template slot-scope="scope">
          <span class="title">{{ scope.row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="labels" label="标签" width="180">
        <template slot-scope="scope">
          <el-tag v-for="(item, index) in scope.row.labels" :key="index"
                  :type="item === '前端' ? 'primary' : 'success'" disable-transitions style="margin:0 5px;"
          >{{
              item
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row._id)" type="primary">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row._id, scope.$index)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:50px;"
      >
        <el-form-item :label="$t('table.type')" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name"
                       :value="item.display_name"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.date')" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date"/>
        </el-form-item>
        <el-form-item :label="$t('table.title')" prop="title">
          <el-input v-model="temp.title"/>
        </el-form-item>
        <el-form-item :label="$t('table.status')">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.importance')">
          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3"
                   style="margin-top:8px;"
          />
        </el-form-item>
        <el-form-item :label="$t('table.remark')">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                    placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
import { DeleteOneArticle, GetArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'js', display_name: '前端' },
  { key: 'node', display_name: '后端' },
  { key: 'other', display_name: '其他' }
]
export default {
  name: 'ComplexArticles',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      searchList: {
        type: '',
        title: ''
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 编辑文章
    handleEdit(id) {
      console.log(id)
      this.$router.push({ name: 'article_add', query: { id } })
    },
    // 删除文章
    // err: 删除后没有刷新
    handleDelete(_id, index) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        console.log(_id)
        let rel = await DeleteOneArticle(_id)
        console.log(rel)
        if (rel.data.msg === 'ok') {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          console.log(index)
          this.list.splice(index, 1)
        } else {
          this.$message({
            type: 'danger',
            message: '删除失败!'
          })
        }
      }).catch(() => {
        console.log('first')
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 跳转到添加文章
    goArticleAdd() {
      this.$router.push({ name: 'article_add' })
    },
    async getList() {
      const query = {}
      if (this.searchList.type) {
        query.labels = this.searchList.type.trim()
      }
      if (this.searchList.title) {
        query.title = this.searchList.title.trim()
      }
      let rel = await GetArticle(query)
      this.list = rel.data
      this.total = rel.data.length
      // console.log(this.list);
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      let { prop, order } = data
      // "ascending" 小到大
      // "descending" 大到小
      console.log(data)
      if (prop === 'date') {
        this.sortByDate(order)
      }
    },
    sortByDate(order) {
      // 对时间进行排序
      if (order === 'ascending') {
        this.list.sort((a, b) => {
          if (a.date.toUpperCase() > b.date.toUpperCase()) return -1
        })
      } else {
        this.list.sort((a, b) => {
          if (a.date.toUpperCase() < b.date.toUpperCase()) return -1
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.title {
  max-height: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>


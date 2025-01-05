<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>销售管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-row :gutter="10" style="margin-bottom: 20px;">
            <el-col :span="6">
                <el-input v-model="orderCodeQuery" placeholder="请输入订单编码" clearable></el-input>
            </el-col>
            <el-col :span="6">
                <el-input v-model="orderNameQuery" placeholder="请输入订单名称" clearable></el-input>
            </el-col>

            <el-col :span="6">
                <el-button type="plain" @click="handleSearch">查询</el-button>
                <el-button type="primary" @click="handleAdd">新增</el-button>
                <el-button type="primary" @click="handleReset">重置</el-button>

            </el-col>

        </el-row>

        <el-table :data="filteredTableData" stripe style="width: 100%">
            <el-table-column prop="id" label="编号" width="150" />
            <el-table-column prop="name" label="名称" width="100" />
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="source" label="来源" width="100" />
            <el-table-column prop="orderDate" label="订单日期（UTC）" width="180">
                <template #default="scope">
                    {{ new Date(scope.row.orderDate).toUTCString() }}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
                    <el-button type="info" plain @click="handleView(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
            :size="size" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
            :total="totalOrders" @size-change="handleSizeChange" @current-change="handleCurrentChange" />

        <!-- 新增订单对话框 -->
        <el-dialog v-model="addDialogVisible" title="新增订单" width="60%">
            <el-form :model="newForm" :rules="newRules" ref="addForm" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="newForm.name" type="text"></el-input>
                </el-form-item>
                <el-form-item label="来源" prop="source">
                    <el-input v-model="newForm.source" type="text"></el-input>
                </el-form-item>
                <el-form-item label="数量" prop="quantity">
                    <el-input v-model.number="newForm.quantity" type="number"></el-input>
                </el-form-item>
                <el-form-item label="订单日期" prop="orderDate">
                    <el-date-picker v-model="newForm.orderDate" type="datetime" placeholder="选择日期时间"></el-date-picker>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitAddForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 编辑订单对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑订单" width="60%">
            <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editForm.name" type="text"></el-input>
                </el-form-item>
                <el-form-item label="数量" prop="quantity">
                    <el-input v-model.number="editForm.quantity" type="number"></el-input>
                </el-form-item>
                <el-form-item label="来源" prop="source">
                    <el-input v-model="editForm.source" type="text"></el-input>
                </el-form-item>
                <el-form-item label="订单日期" prop="orderDate">
                    <el-date-picker v-model="editForm.orderDate" type="datetime" placeholder="选择日期时间"></el-date-picker>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitEditForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 查看订单对话框 -->
        <el-dialog v-model="viewDialogVisible" title="查看订单" width="60%">
            <el-form :model="viewForm" label-width="100px">
                <el-form-item label="编号">
                    <el-input v-model="viewForm.id" disabled></el-input>
                </el-form-item>
                <el-form-item label="名称">
                    <el-input v-model="viewForm.name" disabled></el-input>
                </el-form-item>
                <el-form-item label="数量">
                    <el-input v-model.number="viewForm.quantity" disabled></el-input>
                </el-form-item>
                <el-form-item label="来源">
                    <el-input v-model="viewForm.source" disabled></el-input>
                </el-form-item>
                <el-form-item label="订单日期">
                    <el-input v-model="viewForm.orderDate" disabled></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="viewDialogVisible = false">关闭</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import axios from '../utils/axios'

interface OrderResponse {
    data: {
        records: Order[];
        total: number;
    };
}

interface Order {
    id: string;
    name: string;
    source: string;
    quantity: number;
    orderDate: string | Date;
}

interface FetchOrdersParams {
    page?: number;
    pageSize?: number;
    name?: string;
    id?: string;
    type?: string;
}

export default defineComponent({
    name: 'OrderPageTwo',
    setup() {
        const currentPage = ref(1)
        const pageSize = ref(10)
        const size = ref('default')
        const background = ref(false)
        const disabled = ref(false)
        const orderCodeQuery = ref('')
        const orderNameQuery = ref('')
        const orderType = ref('all')

        const tableData = ref<Order[]>([])
        const totalOrders = ref(0)

        const addFormRef = ref<InstanceType<typeof ElForm> | null>(null);
        const editFormRef = ref<InstanceType<typeof ElForm> | null>(null);

        const fetchOrders = async (params: FetchOrdersParams) => {
            try {
                const response: OrderResponse = await axios.post('/order/page', params)
                tableData.value = response.data.records
                totalOrders.value = response.data.total
            } catch (error) {
                console.error('获取订单列表失败:', error)
                ElMessage.error('获取订单列表失败')
            }
        }

        const filteredTableData = computed(() => {
            let filteredData = tableData.value

            if (orderCodeQuery.value) {
                filteredData = filteredData.filter(item =>
                    item.id.toString().includes(orderCodeQuery.value)
                )
            }

            if (orderNameQuery.value) {
                filteredData = filteredData.filter(item =>
                    item.name.toLowerCase().includes(orderNameQuery.value.toLowerCase())
                )
            }

            if (orderType.value !== 'all') {
                filteredData = filteredData.filter(item =>
                    item.source === orderType.value
                )
            }

            return filteredData
        })

        const handleSearch = () => {
            const params: FetchOrdersParams = {
                name: orderNameQuery.value,
                page: currentPage.value,
                pageSize: pageSize.value
            };

            if (orderCodeQuery.value) {
                const id = parseInt(orderCodeQuery.value, 10);
                if (!isNaN(id)) {
                    params.id = id;
                }
            }

            if (orderType.value !== 'all') {
                params.type = orderType.value;
            }

            fetchOrders(params);
        }

        const handleReset = () => {
            orderCodeQuery.value = ''
            orderNameQuery.value = ''
            orderType.value = 'all'
            handleSearch()
        }

        const handleSizeChange = (val: number) => {
            currentPage.value = 1; // 重置到第一页
            pageSize.value = val;
            handleSearch();
        }

        const handleCurrentChange = (val: number) => {
            currentPage.value = val;
            handleSearch();
        }

        const addDialogVisible = ref(false)
        const newForm = ref({
            name: '',
            source: '',
            quantity: null as number | null,
            orderDate: '' as string | Date,
            type: 'purchase' // 默认类型
        })
        const newRules = {
            name: [
                { required: true, message: '请输入订单名称', trigger: 'blur' }
            ],
            source: [
                { required: true, message: '请输入订单来源', trigger: 'blur' }
            ],
            quantity: [
                { required: true, message: '请输入数量', trigger: 'change' }
            ],
            orderDate: [
                { required: true, message: '请选择订单日期', trigger: 'change' }
            ]
        }

        const handleAdd = () => {
            newForm.value = {
                name: '',
                source: '',
                quantity: null,
                orderDate: '',
                type: 'purchase'
            }
            addDialogVisible.value = true
        }

        const submitAddForm = () => {
            if (!addFormRef.value) return;

            addFormRef.value.validate(async (valid: boolean) => {
                if (valid) {
                    try {
                        await axios.post('/order/insert', {
                            name: newForm.value.name,
                            quantity: newForm.value.quantity,
                            orderDate: newForm.value.orderDate,
                            source: newForm.value.source,
                            type: newForm.value.type
                        })
                        ElMessage.success('新增成功')
                        addDialogVisible.value = false
                        handleSearch()
                    } catch (error) {
                        console.error('新增订单失败:', error)
                        ElMessage.error('新增失败')
                    }
                } else {
                    console.log('表单验证失败')
                    return;
                }
            })
        }

        const editDialogVisible = ref(false)
        const editForm = ref({
            id: '' as string,
            name: '',
            source: '',
            quantity: null as number | null,
            orderDate: '' as string | Date,

        })
        const editRules = {
            name: [
                { required: true, message: '请输入订单名称', trigger: 'blur' }
            ],
            source: [
                { required: true, message: '请输入订单来源', trigger: 'blur' }
            ],
            quantity: [
                { required: true, message: '请输入数量', trigger: 'change' }
            ],
            orderDate: [
                { required: true, message: '请选择订单日期', trigger: 'change' }
            ]
        }

        const handleEdit = (row: Order) => {
            editForm.value = { ...row }
            editDialogVisible.value = true
        }

        const submitEditForm = () => {
            if (!editFormRef.value) return;

            editFormRef.value.validate(async (valid: boolean) => {
                if (valid) {
                    try {
                        await axios.post('order/update', {
                            id: editForm.value.id,
                            name: editForm.value.name,
                            quantity: editForm.value.quantity,
                            orderDate: editForm.value.orderDate,
                            source: editForm.value.source,

                        })
                        ElMessage.success('修改成功')
                        editDialogVisible.value = false
                        handleSearch()
                    } catch (error) {
                        console.error('修改订单失败:', error)
                        ElMessage.error('修改失败')
                    }
                } else {
                    console.log('表单验证失败')
                    return;
                }
            })
        }

        const handleDelete = (row: Order) => {
            ElMessageBox.confirm('确定删除该订单?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await axios.post(`/order/delete?id=${row.id}`)
                    ElMessage.success('删除成功')
                    handleSearch()
                } catch (error) {
                    console.error('删除订单失败:', error)
                    ElMessage.error('删除失败')
                }
            }).catch(() => {
                ElMessage.info('已取消删除')
            })
        }

        const viewDialogVisible = ref(false)
        const viewForm = ref({
            id: '' as string,
            name: '',
            source: '',
            quantity: null as number | null,
            orderDate: '' as string | Date,
        })
        const handleView = async (row: Order) => {
            try {
                const order = tableData.value.find(item => item.id === row.id);
                if (order) {
                    viewForm.value = {
                        id: order.id,
                        name: order.name,
                        source: order.source,
                        quantity: order.quantity,
                        orderDate: new Date(order.orderDate) // 将时间戳转换为Date对象
                    };
                    viewDialogVisible.value = true;
                } else {
                    ElMessage.error('未找到订单详情');
                }
            } catch (error) {
                console.error('获取订单详情失败:', error);
                ElMessage.error('获取订单详情失败');
            }
        };

        // 初始化加载订单列表
        fetchOrders({
            page: currentPage.value,
            pageSize: pageSize.value
        })

        return {
            currentPage,
            pageSize,
            size,
            background,
            disabled,
            orderCodeQuery,
            orderNameQuery,
            orderType,
            tableData,
            totalOrders,
            filteredTableData,
            handleSearch,
            handleReset,
            handleSizeChange,
            handleCurrentChange,
            addDialogVisible,
            newForm,
            newRules,
            handleAdd,
            submitAddForm,
            editDialogVisible,
            editForm,
            editRules,
            handleEdit,
            submitEditForm,
            handleDelete,
            viewDialogVisible,
            viewForm,
            handleView,
            addFormRef,
            editFormRef
        }
    }
})
</script>
<style lang="less" scoped>
.input-with-select .el-input-group__prepend {
    background-color: var(--el-fill-color-blank);
}
</style>
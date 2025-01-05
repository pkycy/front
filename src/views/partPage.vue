<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>部件管理</el-breadcrumb-item>
            <el-breadcrumb-item>部件列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-row :gutter="10" style="margin-bottom: 20px;">
            <el-col :span="6">
                <el-input v-model="orderCodeQuery" placeholder="请输入编号" clearable></el-input>
            </el-col>
            <el-col :span="6">
                <el-input v-model="orderNameQuery" placeholder="请输入名称" clearable></el-input>
            </el-col>
            <el-col :span="6">
                <el-button type="plain" @click="handleSearch">查询</el-button>
                <el-button type="primary" @click="handleAdd">新增</el-button>
                <el-button type="primary" @click="handleReset">重置</el-button>
            </el-col>
        </el-row>

        <el-table :data="filteredTableData" stripe style="width: 100%">
            <el-table-column prop="id" label="编号" width="150" />
            <el-table-column prop="partName" label="部件名称" width="100" />
            <el-table-column prop="name" label="具体名称" width="100" />
            <el-table-column prop="description" label="说明" width="150" />
            <el-table-column prop="orderDate" label="订单日期（UTC）" width="100">
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

        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 500]"
            :size="size" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
            :total="totalOrders" @size-change="handleSizeChange" @current-change="handleCurrentChange" />

        <!-- 新增部件对话框 -->
        <el-dialog v-model="addDialogVisible" title="新增部件" width="60%">
            <el-form :model="newForm" :rules="newRules" ref="addFormRef" label-width="100px">
                <el-form-item label="部件名称" prop="partName">
                    <el-input v-model="newForm.partName" type="text"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="category">
                    <el-select v-model="newForm.Cls" placeholder="请选择分类">
                        <el-option label="传感器零件" value="传感器零件"></el-option>
                        <el-option label="驱动零件" value="驱动零件"></el-option>
                        <el-option label="执行器零件" value="执行器零件"></el-option>
                        <el-option label="电器零件" value="电器零件"></el-option>
                        <el-option label="控制零件" value="控制零件"></el-option>
                        <el-option label="其他辅助零件" value="其他辅助零件"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="具体名称" prop="name">
                    <el-input v-model="newForm.name" type="text"></el-input>
                </el-form-item>
                <el-form-item label="说明" prop="description">
                    <el-input v-model="newForm.description" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="长度" prop="length">
                    <el-input v-model.number="newForm.length" type="number"></el-input>
                </el-form-item>
                <el-form-item label="高度/厚度" prop="heightThickness">
                    <el-input v-model.number="newForm.heightThickness" type="number"></el-input>
                </el-form-item>
                <el-form-item label="大小" prop="size">
                    <el-input v-model="newForm.size" type="text"></el-input>
                </el-form-item>
                <el-form-item label="重量" prop="weight">
                    <el-input v-model.number="newForm.weight" type="number"></el-input>
                </el-form-item>
                <el-form-item label="型号" prop="model">
                    <el-input v-model="newForm.model" type="text"></el-input>
                </el-form-item>
                <el-form-item label="品牌" prop="brand">
                    <el-input v-model="newForm.brand" type="text"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitAddForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 编辑部件对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑部件" width="60%">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
                <el-form-item label="编号" prop="id">
                    <el-input v-model="editForm.id" type="text" disabled></el-input>
                </el-form-item>
                <el-form-item label="部件名称" prop="partName">
                    <el-input v-model="editForm.partName" type="text"></el-input>
                </el-form-item>
                <el-form-item label="具体名称" prop="name">
                    <el-input v-model="editForm.specificName" type="text"></el-input>
                </el-form-item>
                <el-form-item label="说明" prop="description">
                    <el-input v-model="editForm.description" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="category">
                    <el-select v-model="editForm.category" placeholder="请选择分类">
                        <el-option label="传感器零件" value="传感器零件"></el-option>
                        <el-option label="驱动零件" value="驱动零件"></el-option>
                        <el-option label="执行器零件" value="执行器零件"></el-option>
                        <el-option label="电器零件" value="电器零件"></el-option>
                        <el-option label="控制零件" value="控制零件"></el-option>
                        <el-option label="其他辅助零件" value="其他辅助零件"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="长度" prop="length">
                    <el-input v-model.number="editForm.length" type="number"></el-input>
                </el-form-item>
                <el-form-item label="高度/厚度" prop="heightThickness">
                    <el-input v-model.number="editForm.heightThickness" type="number"></el-input>
                </el-form-item>
                <el-form-item label="大小" prop="size">
                    <el-input v-model="editForm.size" type="text"></el-input>
                </el-form-item>
                <el-form-item label="重量" prop="weight">
                    <el-input v-model.number="editForm.weight" type="number"></el-input>
                </el-form-item>
                <el-form-item label="型号" prop="model">
                    <el-input v-model="editForm.model" type="text"></el-input>
                </el-form-item>
                <el-form-item label="品牌" prop="brand">
                    <el-input v-model="editForm.brand" type="text"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitEditForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 查看部件对话框 -->
        <el-dialog v-model="viewDialogVisible" title="查看部件" width="60%">
            <el-form :model="viewForm" label-width="100px">
                <el-form-item label="编号">
                    <el-input v-model="viewForm.id" disabled></el-input>
                </el-form-item>
                <el-form-item label="部件名称">
                    <el-input v-model="viewForm.partName" disabled></el-input>
                </el-form-item>
                <el-form-item label="分类">
                    <el-input v-model="viewForm.category" disabled></el-input>
                </el-form-item>
                <el-form-item label="具体名称">
                    <el-input v-model="viewForm.specificName" disabled></el-input>
                </el-form-item>
                <el-form-item label="说明">
                    <el-input v-model="viewForm.description" type="textarea" disabled></el-input>
                </el-form-item>
                <el-form-item label="长度">
                    <el-input v-model.number="viewForm.length" disabled></el-input>
                </el-form-item>
                <el-form-item label="高度/厚度">
                    <el-input v-model.number="viewForm.heightThickness" disabled></el-input>
                </el-form-item>
                <el-form-item label="大小">
                    <el-input v-model="viewForm.size" disabled></el-input>
                </el-form-item>
                <el-form-item label="重量">
                    <el-input v-model.number="viewForm.weight" disabled></el-input>
                </el-form-item>
                <el-form-item label="型号">
                    <el-input v-model="viewForm.model" disabled></el-input>
                </el-form-item>
                <el-form-item label="品牌">
                    <el-input v-model="viewForm.brand" disabled></el-input>
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
import { defineComponent, ref, computed, unref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import axios from '../utils/axios'


const addFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const editFormRef = ref<InstanceType<typeof ElForm> | null>(null);
interface ApiResponse<T> {
    code: number;
    msg: string | null;
    data: T | null | [T];
}

interface Part {
    id: string;
    name: string;
    description: string;
    partName: string;
    attrDefs: [
        {
            "key": string,
            "value": string
        },
        {
            "key": string,
            "value": string
        }
    ] | null;
    cls: string | null;

}

interface PartPageResponse {

    total: number;
    records: Part[];
}

interface ClsDef {
    id: string;
    name: string;
    description: string;
    attrDefs: {
        id: number | null;
        name: string;
        enName: string;
        description: string | null;
        type: string | null;
    }[];
}

export default defineComponent({
    name: 'PartPage',
    setup() {
        const currentPage = ref(1)
        const pageSize = ref(10)
        const size = ref('default')
        const background = ref(false)
        const disabled = ref(false)
        const orderCodeQuery = ref('')
        const orderNameQuery = ref('')
        const orderType = ref('all')

        const tableData = ref<Part[]>([])
        const totalOrders = ref(0)

        const filteredTableData = computed(() => {
            let filteredData = tableData.value.map(item => ({
                ...item,

            }));
            if (orderCodeQuery.value) {
                filteredData = filteredData.filter(item =>
                    item.id.toString().includes(orderCodeQuery.value)
                )
            }

            if (orderNameQuery.value) {
                filteredData = filteredData.filter(item =>
                    item.partName.toLowerCase().includes(orderNameQuery.value.toLowerCase()) ||
                    item.name.toLowerCase().includes(orderNameQuery.value.toLowerCase())
                )
            }


            return filteredData
        })

        const clsDefs = ref<ClsDef[]>([])

        const fetchData = async () => {
            try {
                const response = await axios.post<ApiResponse<PartPageResponse>>('/part/page', {

                    id: orderCodeQuery.value ? parseInt(orderCodeQuery.value, 10) : undefined,
                    name: orderNameQuery.value,
                    page: currentPage.value,
                    pageSize: pageSize.value

                });
                if (response.code === 1) {
                    console.log('获取部件列表响应:', response.data);
                    tableData.value = response.data.records;

                    totalOrders.value = response.data.total;
                    ElMessage.success('获取部件列表成功');
                } else {
                    ElMessage.error('获取部件列表失败: ' + (response.data.msg || '未知错误'));
                }
            } catch (error) {
                console.error('获取部件列表失败:', error);
                ElMessage.error('获取部件列表失败');
            }
        }

        const fetchClsDefs = async () => {
            try {
                const response = await axios.get<ApiResponse<ClsDef[]>>('/part/listClsDefs');
                if (response.code === 1) {

                    ElMessage.success('获取分类定义成功');
                } else {
                    ElMessage.error('获取分类定义失败: ' + (response.data.msg || '未知错误'));
                }
            } catch (error) {
                console.error('获取分类定义失败:', error);
                ElMessage.error('获取分类定义失败');
            }
        }

        onMounted(() => {
            fetchData();
            fetchClsDefs();
        })

        const handleSearch = () => {
            console.log('Search for:', orderCodeQuery.value, orderNameQuery.value, orderType.value)
            currentPage.value = 1; // 重置到第一页
            fetchData();
        }

        const handleReset = () => {
            orderCodeQuery.value = ''
            orderNameQuery.value = ''
            orderType.value = 'all'
            currentPage.value = 1;
            fetchData();
        }

        const handleSizeChange = (val: number) => {
            console.log(`${val} items per page`)
            pageSize.value = val;
            fetchData();
        }

        const handleCurrentChange = (val: number) => {
            console.log(`current page: ${val}`)
            currentPage.value = val;
            fetchData();
        }

        const addDialogVisible = ref(false)
        const newForm = ref({
            id: '' as string,
            name: '' as string,
            partName: '' as string,
            Cls: '' as string,

            description: '' as string,
            length: null as number | null,
            heightThickness: null as number | null,
            size: '',
            weight: null as number | null,
            model: '',
            brand: '',
            orderDate: '' as string | Date,

        })
        const newRules = {
            partName: [
                { required: true, message: '请输入部件名称', trigger: 'blur' }
            ],
            Cls: [
                { required: true, message: '请选择分类', trigger: 'change' }
            ],
            name: [
                { required: true, message: '请输入具体名称', trigger: 'blur' }
            ],
            description: [
                { required: true, message: '请输入说明', trigger: 'blur' }
            ],
            length: [
                { required: true, message: '请输入长度', trigger: 'change' }
            ],
            heightThickness: [
                { required: true, message: '请输入高度/厚度', trigger: 'change' }
            ],
            size: [
                { required: true, message: '请输入大小', trigger: 'blur' }
            ],
            weight: [
                { required: true, message: '请输入重量', trigger: 'change' }
            ],
            model: [
                { required: true, message: '请输入型号', trigger: 'blur' }
            ],
            brand: [
                { required: true, message: '请输入品牌', trigger: 'blur' }
            ],
            orderDate: [
                { required: true, message: '请选择订单日期', trigger: 'change' }
            ],
            type: [
                { required: true, message: '请选择类型', trigger: 'change' }
            ]
        }

        const handleAdd = () => {

            newForm.value = {
                id: '' as string,
                partName: '',
                Cls: '',
                name: '',
                description: '',
                length: null,
                heightThickness: null,
                size: '',
                weight: null,
                model: '',
                brand: '',
                orderDate: '',

            }
            addDialogVisible.value = true
        }
        const submitAddForm = async () => {
            const formRef = unref(addFormRef);
            if (!formRef) return;

            await formRef.validate(async (valid: boolean) => {
                if (valid) {
                    try {
                        const response = await axios.post<ApiResponse<Part>>('/part/insert', {
                            id: newForm.value.id,
                            name: newForm.value.partName,
                            description: newForm.value.description,
                            partName: newForm.value.name,
                            cls: newForm.value.Cls,
                            attrs: [
                                { key: '品牌', value: newForm.value.brand },
                                { key: '型号', value: newForm.value.model },
                                { key: '重量', value: newForm.value.weight?.toString() || '' },
                                { key: '大小', value: newForm.value.size },
                                { key: '高度/厚度', value: (newForm.value.heightThickness ?? 0).toString() }, // 使用默认值 0 替换 null
                                { key: '长度', value: newForm.value.length?.toString() || '' }
                            ]
                        });
                        if (response.code === 1) {
                            ElMessage.success('新增成功');
                            handleSearch();

                            addDialogVisible.value = false;
                        } else {
                            ElMessage.error('新增失败: ' + (response.data.msg || '未知错误'));
                        }
                    } catch (error) {
                        console.error('新增部件失败:', error);
                        ElMessage.error('新增部件失败');
                    }
                } else {
                    console.log('表单验证失败');
                    return;
                }
            });
        }

        const submitEditForm = async () => {

            if (!editFormRef.value) return;

            editFormRef.value.validate(async (valid: boolean) => {
                if (valid) {
                    try {
                        const response = await axios.post<ApiResponse<Part>>('/part/update', {
                            id: editForm.value.id,
                            name: editForm.value.partName,
                            description: editForm.value.description,
                            partName: editForm.value.specificName,
                            cls: editForm.value.category,
                            attrs: [
                                { key: '品牌', value: editForm.value.brand },
                                { key: '型号', value: editForm.value.model },
                                { key: '重量', value: editForm.value.weight?.toString() || '' },
                                { key: '大小', value: editForm.value.size },
                                { key: '高度/厚度', value: editForm.value.heightThickness?.toString() || '' },
                                { key: '长度', value: editForm.value.length?.toString() || '' }
                            ]
                        });
                        if (response.code === 1) {
                            ElMessage.success('修改成功');
                            const index = tableData.value.findIndex(item => item.id === editForm.value.id);
                            if (index !== -1) {
                                tableData.value[index] = {
                                    ...editForm.value,


                                };
                            }
                            editDialogVisible.value = false;
                        } else {
                            ElMessage.error('修改失败: ' + (response.data.msg || '未知错误'));
                        }
                    } catch (error) {
                        console.error('修改部件失败:', error);
                        ElMessage.error('修改部件失败');
                    }
                } else {
                    console.log('表单验证失败');
                    return;
                }
            });
        }
        const editDialogVisible = ref(false)
        const editForm = ref({
            id: '' as string,
            partName: '',
            category: '',
            specificName: '',
            description: '',
            length: null as number | null,
            heightThickness: null as number | null,
            size: '',
            weight: null as number | null,
            model: '',
            brand: '',
            orderDate: '' as string | Date,
            type: 'purchase'
        })
        const editRules = {
            id: [
                { required: true, message: '编号不能为空', trigger: 'blur' }
            ],
            partName: [
                { required: true, message: '请输入部件名称', trigger: 'blur' }
            ],
            category: [
                { required: true, message: '请选择分类', trigger: 'change' }
            ],
            specificName: [
                { required: true, message: '请输入具体名称', trigger: 'blur' }
            ],
            description: [
                { required: true, message: '请输入说明', trigger: 'blur' }
            ],
            length: [
                { required: true, message: '请输入长度', trigger: 'change' }
            ],
            heightThickness: [
                { required: true, message: '请输入高度/厚度', trigger: 'change' }
            ],
            size: [
                { required: true, message: '请输入大小', trigger: 'blur' }
            ],
            weight: [
                { required: true, message: '请输入重量', trigger: 'change' }
            ],
            model: [
                { required: true, message: '请输入型号', trigger: 'blur' }
            ],
            brand: [
                { required: true, message: '请输入品牌', trigger: 'blur' }
            ],
            orderDate: [
                { required: true, message: '请选择订单日期', trigger: 'change' }
            ],
            type: [
                { required: true, message: '请选择类型', trigger: 'change' }
            ]
        }

        const handleEdit = (row: Part) => {
            editForm.value.id = row.id
            editForm.value.partName = row.partName

            editForm.value.specificName = row.name
            editForm.value.description = row.description

            if (row.attrDefs) {
                row.attrDefs.forEach(attr => {
                    switch (attr.key) {
                        case '品牌':
                            editForm.value.brand = attr.value;
                            break;
                        case '型号':
                            editForm.value.model = attr.value;
                            break;
                        case '重量':
                            editForm.value.weight = parseFloat(attr.value) || null;
                            break;
                        case '大小':
                            editForm.value.size = attr.value;
                            break;
                        case '高度/厚度':
                            editForm.value.heightThickness = parseFloat(attr.value) || null;
                            break;
                        case '长度':
                            editForm.value.length = parseFloat(attr.value) || null;
                            break;
                        default:
                            break;
                    }
                });
            }
            editDialogVisible.value = true
        }

        const handleDelete = (row: Part) => {
            ElMessageBox.confirm('确定删除该订单?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const response = await axios.post<ApiResponse<Part>>(`/part/delete?id=${row.id}`);

                    if (response.code === 1) {
                        ElMessage.success('删除成功');
                        handleSearch();
                        const index = tableData.value.findIndex(item => item.id === row.id);
                        if (index !== -1) {
                            tableData.value.splice(index, 1);
                        }
                        totalOrders.value -= 1;

                        if (filteredTableData.value.length === 0 && currentPage.value > 1) {
                            currentPage.value -= 1;
                        }
                        handleSearch();
                    } else {
                        ElMessage.error('删除失败: ' + (response.data.msg || '未知错误'));
                    }
                } catch (error) {
                    console.error('删除部件失败:', error);
                    ElMessage.error('删除部件失败');
                }
            }).catch(() => {
                ElMessage.info('已取消删除');
            });
        };

        const viewDialogVisible = ref(false)
        const viewForm = ref({
            id: '' as string,
            partName: '',
            category: '' as string | null,
            specificName: '',
            description: '',
            length: null as string | null,
            heightThickness: null as string | null,
            size: null as string | null,
            weight: null as string | null,
            model: '' as string | null,
            brand: '' as string | null,

        })

        const handleView = (row: Part) => {
            try {
                const part = tableData.value.find(item => item.id === row.id);

                if (part) {
                    viewForm.value = {
                        id: row.id,
                        partName: row.partName,
                        category: row.cls,
                        specificName: row.name,
                        description: row.description,
                        length: '6',
                        heightThickness: '',
                        size: '',
                        weight: '',
                        model: 'dasf',
                        brand: 'jfjs',

                    }
                    console.log('只执行到这里')
                    if (part.attrDefs) {
                        console.log('执行到只一会')
                        part.attrDefs.forEach(attr => {
                            switch (attr.key) {
                                case '品牌':
                                    viewForm.value.brand = attr.value;
                                    break;
                                case '型号':
                                    viewForm.value.model = attr.value;
                                    break;
                                case '重量':
                                    viewForm.value.weight = attr.value;
                                    break;
                                case '大小':
                                    viewForm.value.size = attr.value;
                                    break;
                                case '高度/厚度':
                                    viewForm.value.heightThickness = attr.value;
                                    break;
                                case '长度':
                                    viewForm.value.length = attr.value;
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                    viewDialogVisible.value = true
                }
            } catch (error) {
                console.error('获取订单详情失败:', error);
                ElMessage.error('获取订单详情失败');
            }
        }

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
            clsDefs,
            editFormRef,
            addFormRef

        }
    }
})
</script>
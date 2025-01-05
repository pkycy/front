<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>
                <a href="/">蓝图管理</a>
            </el-breadcrumb-item>
            <el-breadcrumb-item>蓝图列表</el-breadcrumb-item>
        </el-breadcrumb>
    </div>

    <el-row :gutter="10">
        <el-col :span="6">
            <el-input v-model="searchQuery" style="max-width: 600px" placeholder="请输入蓝图名称或编号" class="input-with-select"
                clearable>
            </el-input>
        </el-col>
        <el-col :span="7">
            <el-button type="default" plain @click="handleSearch">查询</el-button>
            <el-button type="primary" plain @click="handleAdd">新增</el-button>
            <el-button type="primary" plain @click="handleReset">重置</el-button>
        </el-col>
    </el-row>

    <el-table :data="filteredTableData" stripe style="width: 100%">
        <el-table-column prop="id" label="编号" width="200" />
        <el-table-column prop="blueprint" label="蓝图" width="200">
        </el-table-column>
        <el-table-column prop="description" label="说明" width="180" />
        <el-table-column label="操作">
            <template #default="scope">
                <el-button type="primary" plain :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button type="danger" plain :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                <el-button type="info" plain @click="handleView(scope.row)">查看详情</el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination v-model:current-page="currentPage4" v-model:page-size="pageSize4" :page-sizes="[5, 10, 20, 50]"
        :size="size" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
        :total="totalOrders" @size-change="handleSizeChange" @current-change="handleCurrentChange" />

    <!-- 编辑蓝图信息对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑蓝图信息" width="60%">
        <el-form :model="form" :rules="rules" ref="editForm" label-width="100px">
            <el-form-item label="蓝图" prop="blueprint">
                <el-upload class="upload-demo" action="/blueprint/upload" :on-preview="handlePreview"
                    :on-remove="handleRemove" :before-remove="beforeRemove" multiple :limit="1"
                    :on-exceed="handleExceed" :file-list="fileList" :auto-upload="false" ref="uploadRef"
                    :on-success="handleUploadSuccess">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <template #tip>
                        <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </template>
                </el-upload>
            </el-form-item>
            <el-form-item label="说明" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="8"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">确定</el-button>
            </span>
        </template>
    </el-dialog>

    <!-- 新增蓝图信息对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增蓝图信息" width="60%">
        <el-form :model="newForm" :rules="newRules" ref="addForm" label-width="100px">
            <el-form-item label="蓝图" prop="blueprint">
                <el-upload class="upload-demo" action="/blueprint/upload" :on-preview="handlePreview"
                    :before-upload="beforeUpload" :on-remove="handleRemove" :before-remove="beforeRemove" multiple
                    :limit="1" :on-exceed="handleExceed" :file-list="newFileList" :auto-upload="false"
                    ref="addUploadRef" :on-success="handleAddUploadSuccess">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <template #tip>
                        <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </template>
                </el-upload>
            </el-form-item>
            <el-form-item label="说明" prop="description">
                <el-input v-model="newForm.description" type="textarea" :rows="8"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitAddForm">确定</el-button>
            </span>
        </template>
    </el-dialog>

    <!-- 查看蓝图信息对话框 -->
    <el-dialog v-model="viewDialogVisible" title="查看蓝图信息" width="60%">
        <el-form :model="viewForm" label-width="100px">
            <el-form-item label="编号">
                <el-input v-model="viewForm.id" disabled></el-input>
            </el-form-item>
            <el-form-item label="蓝图">
                <div style="display: flex; align-items: center;">
                    <el-button type="primary" plain @click="downloadBlueprint(viewForm.id)">下载</el-button>
                </div>
            </el-form-item>
            <el-form-item label="说明">
                <el-input v-model="viewForm.description" type="textarea" disabled :rows="8"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="viewDialogVisible = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElUpload, ElButton, ElForm, ElFormItem, ElInput, ElDialog, ElMessageBox } from 'element-plus'
import { ref, computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import axios from '../utils/axios'
import type { UploadFile } from 'element-plus';
import type { UploadFiles } from 'element-plus';
import type { UploadUserFile } from 'element-plus';

interface BlueprintResponse {
    code: number;
    msg: string | null;
    data: {
        id: number;
        blueprintDescription: string;
        bluePrint: {
            id: number;
            name: string;
        };
    }[];
}

interface Blueprint {
    id: number;
    blueprint: string;
    description: string;
}

interface FetchId {
    id: number;
}
interface FetchBlueprintParams {
    id?: number;
    page?: number;
    pageSize?: number;
}

interface UploadResponse {
    code: number;
    msg: string | null;
    data: {
        id: number;
    };
}

const currentPage4 = ref(1)
const pageSize4 = ref(10)
const size = ref<'default'>('default')
const background = ref(false)
const disabled = ref(false)
const searchQuery = ref('')
const tableData = ref<Blueprint[]>([])
const totalOrders = ref(0)

const fetchBlueprints = async (params: FetchBlueprintParams) => {
    try {
        const response = await axios.post<BlueprintResponse>('/blueprint/page', params);
        tableData.value = response.data.records;
        totalOrders.value = response.data.total;
    } catch (error) {
        console.error('获取蓝图列表失败:', error);
        ElMessage.error('获取蓝图列表失败');
    }
}

const filteredTableData = computed(() => {
    if (!searchQuery.value) return tableData.value

    const query = searchQuery.value.toLowerCase()
    const isNumberQuery = !isNaN(Number(query))

    return tableData.value.filter(item => {
        if (isNumberQuery) {
            return item.id.toString().includes(query)
        } else {
            return item.blueprint.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
        }
    })
})

const handleSearch = () => {
    const params: FetchBlueprintParams = {
        page: currentPage4.value,
        pageSize: pageSize4.value
    };

    if (searchQuery.value) {
        const id = parseInt(searchQuery.value, 10);
        if (!isNaN(id)) {
            params.id = id;
        }
    }

    fetchBlueprints(params);
}

const handleReset = () => {
    searchQuery.value = ''
    handleSearch()
}

const handleSizeChange = (val: number) => {
    currentPage4.value = 1; // 重置到第一页
    pageSize4.value = val;
    handleSearch();
}

const handleCurrentChange = (val: number) => {
    currentPage4.value = val;
    handleSearch();
}

const dialogVisible = ref(false)
const form = ref({
    id: 0,
    blueprint: '',
    description: '',
    bluePrintId: 0
})
const rules = {
    blueprint: [
        { required: true, message: '请上传蓝图图片', trigger: 'change' }
    ],
    description: [
        { required: true, message: '请输入说明', trigger: 'blur' }
    ]
}

const handleEdit = (row: Blueprint) => {
    form.value = {
        id: row.id,
        blueprint: row.blueprint,
        description: row.description,
        bluePrintId: 0 // 初始化为0，后续从上传结果获取
    }
    fileList.value = [{
        name: 'blueprint.jpg',
        url: row.blueprint,
        uid: Date.now(), // 生成唯一的uid
        status: 'success' // 设置上传状态为成功
    }]
    dialogVisible.value = true
}

const submitForm = async () => {
    if (!editForm.value) return;

    editForm.value.validate(async (valid: boolean) => {
        if (valid) {
            try {
                // 上传文件
                await uploadFiles('edit');

                // 更新蓝图信息
                await axios.post('/blueprint/update', {
                    id: form.value.id,
                    blueprintDescription: form.value.description,
                    bluePrint: {
                        id: form.value.bluePrintId,
                        name: 'blueprint.jpg' // 假设文件名为blueprint.jpg
                    }
                })
                ElMessage.success('修改成功')
                dialogVisible.value = false
                handleSearch()
            } catch (error) {
                console.error('修改蓝图失败:', error)
                ElMessage.error('修改失败')
            }
        } else {
            console.log('表单验证失败')
            return;
        }
    })
}

const fileList = ref<UploadFiles>([])
const uploadRef = ref<InstanceType<typeof ElUpload> | null>(null)

const handleRemove = (file: UploadFile, fileList: UploadFiles) => {
    console.log(file, fileList)
}

const handlePreview = (file: UploadFile) => {
    console.log(file)
}

const handleExceed: (files: File[], uploadFiles: UploadUserFile[]) => void = (files, uploadFiles) => {
    ElMessage.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + uploadFiles.length} 个文件`);
}

const beforeRemove = (file: UploadUserFile) => {
    return ElMessageBox.confirm(`确定移除 ${file.name}？`)
        .then(() => {
            return true; // 确认移除时返回 true
        })
        .catch(() => {
            return false; // 取消移除时返回 false
        });
}
const beforeUpload = (file) => {
    // 创建 FormData 对象
    const formData = new FormData();
    // 添加文件到 FormData 对象
    formData.append('file', file);
    // 添加 bluePrintId 到 FormData 对象
    formData.append('designBlueprintId', null);

    // 使用 axios 上传文件
    axios.post('blueprint/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        if (form.value.id) {
            handleUploadSuccess(response);
        } else {
            handleAddUploadSuccess(response);
        }
    }).catch(error => {
        console.error('上传文件失败:', error);
        ElMessage.error('上传文件失败');
    });

    // 阻止 Element UI 的自动上传
    return false;
};


const handleUploadSuccess: (response: UploadResponse, file: UploadFile, fileList: UploadFiles) => void = (response) => {
    form.value.bluePrintId = response.data.id;
    editForm.value?.clearValidate(['blueprint']);
}

const uploadFiles = async (type: 'edit' | 'add') => {
    if (type === 'edit') {
        if (uploadRef.value) {
            await uploadRef.value.submit();
        }
    } else if (type === 'add') {
        if (addUploadRef.value) {
            await addUploadRef.value.submit();
        }
    }
}

const handleDelete = (row: Blueprint) => {
    ElMessageBox.confirm('确定删除该蓝图?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const params: FetchId = {
                id: row.id
            }
            await axios.post('/blueprint/delete', params)
            ElMessage.success('删除成功')
            handleSearch()
        } catch (error) {
            console.error('删除蓝图失败:', error)
            ElMessage.error('删除失败')
        }
    }).catch(() => {
        ElMessage.info('已取消删除')
    });
}

const viewDialogVisible = ref(false)
const viewForm = ref({
    id: 0,
    blueprint: '',
    description: ''
})

const handleView = (row: Blueprint) => {
    viewForm.value = { ...row }
    viewDialogVisible.value = true
}
const downloadBlueprint = (designBlueprintId) => {
    axios.post('/download', {
        fileId: fileId,
        DesignBlueprintId: designBlueprintId
    }, {
        responseType: 'blob' // 指示 axios 以二进制blob形式接收响应
    })
        .then(response => {
            // 创建一个新的 Blob 对象
            const blob = new Blob([response.data], { type: 'application/octet-stream' });
            // 创建一个链接并模拟点击以下载文件
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'blueprint.jpg'; // 你可以根据实际情况设置文件名
            link.click();
            URL.revokeObjectURL(link.href); // 释放URL对象
        })
        .catch(error => {
            console.error('下载文件失败:', error);
            ElMessage.error('下载文件失败');
        });
};

const addDialogVisible = ref(false)
const newForm = ref({
    blueprint: '',
    description: '',
    bluePrintId: 0
})
const newRules = {
    blueprint: [
        { required: false, message: '请上传蓝图图片', trigger: 'change' }
    ],
    description: [
        { required: true, message: '请输入说明', trigger: 'blur' }
    ]
}

const newFileList = ref<UploadFiles>([])
const addUploadRef = ref<InstanceType<typeof ElUpload> | null>(null)

const handleAdd = () => {
    newForm.value = {
        blueprint: '',
        description: '',
        bluePrintId: 0
    }
    newFileList.value = []
    addDialogVisible.value = true
}

const submitAddForm = async () => {
    if (!addForm.value) return;

    addForm.value.validate(async (valid: boolean) => {
        if (valid) {
            try {
                // 上传文件
                await uploadFiles('add');

                // 新增蓝图信息
                await axios.post('/bluprint/insert', {
                    blueprintDescription: newForm.value.description,

                })
                ElMessage.success('新增成功')
                addDialogVisible.value = false
                handleSearch()
            } catch (error) {
                console.error('新增蓝图失败:', error)
                ElMessage.error('新增失败')
            }
        } else {
            console.log('表单验证失败')
            return;
        }
    });
}

const handleAddUploadSuccess: (response: UploadResponse, file: UploadFile, fileList: UploadFiles) => void = (response) => {
    newForm.value.bluePrintId = response.data.id;
    newForm.value.blueprint = response.data.name; // 更新 blueprint 字段
    newFileList.value = [{ // 更新文件列表
        name: response.data.name,
        url: `/blueprint/download/${response.data.id}`, // 假设下载路径
        uid: Date.now(),
        status: 'success'
    }];
    addForm.value?.clearValidate(['blueprint']);
    addForm.value?.clearValidate('blueprint'); // 清除验证错误
}

// 初始化加载蓝图列表
fetchBlueprints({
    page: currentPage4.value,
    pageSize: pageSize4.value
})

const editForm = ref<InstanceType<typeof ElForm> | null>(null);
const addForm = ref<InstanceType<typeof ElForm> | null>(null);
</script>
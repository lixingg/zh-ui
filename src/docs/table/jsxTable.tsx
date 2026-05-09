import {defineComponent, ref, h} from 'vue'
import {ElTag} from "element-plus";

export default defineComponent({
    name: 'JsxTable',
    setup() {
        const count = ref(0)
        const tableData = [
            {id: 1, name: '张三', age: 28, score: 85, address: 'xxxxxx'},
        ];
        const columns = [
            {prop: 'id', label: 'ID', width: '80'},
            {
                prop: 'name', label: '姓名',
                render: (scope: any) => (
                    <el-tag type={scope.row.age > 18 ? 'success' : 'warning'}>
                        {scope.row.name}
                    </el-tag>
                )
            },
            {prop: 'age', label: '年龄', formatter: (row: any) => `${row.age}岁`},
            {prop: 'address', label: '住址', render: ({row}) => h(ElTag, {type: 'success'}, row.address)},
            {prop: 'score', label: '分数', formatter: (row: any) => `${row.score}分`},
        ];

        return () => (
                <zh-table
                columns={columns}
                data={tableData}
                border={false}
                pagination={{ type: 'front', pageSize: 5 }}
                />
        )
    }
})

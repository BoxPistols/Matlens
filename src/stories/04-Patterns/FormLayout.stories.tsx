import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { Card, SectionCard, Button, Input, Select, Textarea, UnitInput, Checkbox, FormGroup, Divider } from '../../components/atoms'
import { Icon } from '../../components/Icon'

const FormLayoutPattern = () => (
  <div style={{ maxWidth: 560, fontFamily: 'var(--font-ui)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>材料データ登録</h1>
      <Button variant="ghost" size="sm"><Icon name="close" size={14} /></Button>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionCard title="基本情報">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormGroup label="材料名" required>
            <Input placeholder="例: Ti-6Al-4V" />
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <FormGroup label="カテゴリ" required>
              <Select>
                <option value="">選択...</option>
                <option value="metal">金属合金</option>
                <option value="ceramic">セラミクス</option>
                <option value="polymer">ポリマー</option>
                <option value="composite">複合材料</option>
              </Select>
            </FormGroup>
            <FormGroup label="バッチID">
              <Input placeholder="例: B-042" />
            </FormGroup>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="機械特性">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <FormGroup label="硬度">
              <UnitInput unit="HV" inputProps={{ placeholder: '330' }} />
            </FormGroup>
            <FormGroup label="引張強さ">
              <UnitInput unit="MPa" inputProps={{ placeholder: '950' }} />
            </FormGroup>
            <FormGroup label="弾性率">
              <UnitInput unit="GPa" inputProps={{ placeholder: '114' }} />
            </FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <FormGroup label="密度">
              <UnitInput unit="g/cm³" inputProps={{ placeholder: '4.43' }} />
            </FormGroup>
            <FormGroup label="融点">
              <UnitInput unit="°C" inputProps={{ placeholder: '1660' }} />
            </FormGroup>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="備考">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormGroup label="備考・特記事項" hint="組成や加工条件などの追加情報">
            <Textarea placeholder="航空宇宙グレード。高い比強度と優れた耐食性..." />
          </FormGroup>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-md)', cursor: 'pointer' }}>
              <Checkbox defaultChecked /> AI 分析を実行
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-md)', cursor: 'pointer' }}>
              <Checkbox /> ベクトル索引を作成
            </label>
          </div>
        </div>
      </SectionCard>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="default">キャンセル</Button>
        <Button variant="primary"><Icon name="check" size={14} />登録する</Button>
      </div>
    </div>
  </div>
)

const meta: Meta<typeof FormLayoutPattern> = {
  title: 'Patterns/FormLayout',
  component: FormLayoutPattern,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '材料データ登録フォームパターン。SectionCardによるグルーピング、UnitInput、バリデーション表示の組み合わせ例。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof FormLayoutPattern>

export const Default: Story = {}

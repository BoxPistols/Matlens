import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Input, Select, Textarea, Checkbox, UnitInput, FormGroup } from '../../../components/atoms';

const meta: Meta<typeof Input> = {
  title: 'Components/Atoms/FormControls',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'フォーム入力系のアトムコンポーネント群。Input / Select / Textarea / Checkbox / UnitInput / FormGroup を含む。',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
  args: {
    placeholder: '材料名を入力...',
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

/** Input の Controls 操作 */
export const Default: Story = {};

/** 全フォームコントロールを一覧表示 */
export const AllControls: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
      <FormGroup label="テキスト入力" hint="材料名やIDを入力してください">
        <Input placeholder="例: Ti-6Al-4V" />
      </FormGroup>

      <FormGroup label="エラー状態" error="必須項目です">
        <Input placeholder="必須フィールド" error />
      </FormGroup>

      <FormGroup label="セレクト">
        <Select>
          <option value="">カテゴリを選択...</option>
          <option value="metal">金属合金</option>
          <option value="ceramic">セラミクス</option>
          <option value="polymer">ポリマー</option>
          <option value="composite">複合材料</option>
        </Select>
      </FormGroup>

      <FormGroup label="テキストエリア" hint="備考や追加情報を記入">
        <Textarea placeholder="備考を入力..." />
      </FormGroup>

      <FormGroup label="単位付き入力">
        <div style={{ display: 'flex', gap: 8 }}>
          <UnitInput unit="HV" inputProps={{ placeholder: '330' }} className="flex-1" />
          <UnitInput unit="MPa" inputProps={{ placeholder: '950' }} className="flex-1" />
          <UnitInput unit="GPa" inputProps={{ placeholder: '114' }} className="flex-1" />
        </div>
      </FormGroup>

      <FormGroup label="チェックボックス">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-md)', cursor: 'pointer' }}>
            <Checkbox defaultChecked /> AI 分析済み
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-md)', cursor: 'pointer' }}>
            <Checkbox /> 公開
          </label>
        </div>
      </FormGroup>

      <FormGroup label="必須フィールド" required>
        <Input placeholder="必須入力..." />
      </FormGroup>

      <FormGroup label="無効状態">
        <Input placeholder="編集不可" disabled />
      </FormGroup>
    </div>
  ),
};

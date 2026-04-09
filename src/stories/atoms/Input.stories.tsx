import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, Select, Textarea, Checkbox, UnitInput, FormGroup } from '../../components/atoms';

const meta = {
  title: 'Atoms/FormControls',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InputPlayground: Story = {
  args: { placeholder: '材料名を入力してください' },
};

/** 全フォームコントロールの一覧 */
export const AllControls: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <FormGroup label="テキスト入力" required>
        <Input placeholder="例: SUS304-L 改良型" />
      </FormGroup>
      <FormGroup label="エラー状態" error="必須項目です">
        <Input error defaultValue="不正な値" />
      </FormGroup>
      <FormGroup label="無効状態">
        <Input disabled defaultValue="編集不可" />
      </FormGroup>
      <FormGroup label="カテゴリ選択">
        <Select className="w-full">
          <option value="">選択してください</option>
          <option>金属合金</option>
          <option>セラミクス</option>
          <option>ポリマー</option>
          <option>複合材料</option>
        </Select>
      </FormGroup>
      <FormGroup label="テキストエリア" hint="試験条件、観察事項など">
        <Textarea placeholder="備考を入力..." rows={3} />
      </FormGroup>
      <div style={{ display: 'flex', gap: 16 }}>
        <FormGroup label="硬度"><UnitInput unit="HV" inputProps={{ placeholder: '200' }} /></FormGroup>
        <FormGroup label="引張強さ"><UnitInput unit="MPa" inputProps={{ placeholder: '520' }} /></FormGroup>
        <FormGroup label="密度"><UnitInput unit="g/cm³" inputProps={{ placeholder: '7.9', step: '0.1' }} /></FormGroup>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <Checkbox /> AI検出のみ表示
      </label>
    </div>
  ),
};

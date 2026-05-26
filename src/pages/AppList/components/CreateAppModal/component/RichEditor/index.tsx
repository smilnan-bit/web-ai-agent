import React from 'react';
import RichEditor from '@ysf/rich-editor';
import RichColorPicker from '@/pages/AppList/components/CreateAppModal/component/RichEditor/RichColorPicker';
import { useControllableValue, useMemoizedFn } from 'ahooks';
import './index.less';

const RichTextEditor: React.FC = (props) => {
  // const richRef = React.useRef<any>();
  const size = ['32px', '30px', '28px', '26px', '24px', '18px', '17px', '16px', '15px', '14px', '13px', '12px'];

  const fullSetting: Array<any> = [
    ['link', 'bold', 'italic', 'underline', { size }, 'color', { pickerBackGround: RichColorPicker }],
    [{ align: '' }, { align: 'center' }, { align: 'right' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['emoji', 'image'],
    ['clean', 'formatPainter'],
  ];

  const [value, setValue] = useControllableValue(props);

  const handleChange = (value) => {
    setValue(value);
  };

  const custonDropImage = useMemoizedFn((files, callback) => {
    callback([]);
  });

  const toolbar = fullSetting.map((subArray) => subArray.filter((item) => item !== 'image'));
  return (
    <RichEditor
      className="template-rich-text-editor-wrapper"
      pastePlainText={true}
      supportFontTag
      toolbar={toolbar}
      placeholder={'请输入描述'}
      value={value}
      onChange={handleChange}
      imageDrop
      fileDrop={false}
      customDropImage={custonDropImage}
    />
  );
};

export default RichTextEditor;

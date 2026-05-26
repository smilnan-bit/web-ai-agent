import { Button, Checkbox, Form, Input, Modal, Tooltip, message } from 'antd';
import React, { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { AutoSizer, List as VirtualList } from 'react-virtualized';
import cloneDeep from 'lodash/cloneDeep';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import type { TypeToolUseCaseEunm } from '@/constants';
import { ToolUseCaseConfig, trimPattern } from '@/constants';
import { fetchSimilarWordsAdd, fetchSimilarWordsCheck, fetchSimilarWordsUpdate } from '@/api';
import { Shanchu } from '@/assets/icons';
import { GlobalConfigState } from '@/model';
import { CurrentToolState } from '../model';
import { StepActionClassName } from '../utils';
import AigcRecommendModal from './AigcRecommendModal';

const FormItem = Form.Item;
const modulePrefix = 'EditWord';

// web-ai 样式
const FORM_ITEM_LAYOUT = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const EditWord: React.FC<{ initData?: any; onReturn: () => void; toolUseCase: TypeToolUseCaseEunm }> = ({
  initData,
  onReturn,
  toolUseCase,
}) => {
  const [form] = Form.useForm();
  const currentToolValue = useRecoilValue(CurrentToolState);
  const { toolId } = currentToolValue || {};
  const [similarTmpCheckError, setSimilarTmpCheckError] = useState(''); // 相似问题临时校验错误
  const [similarTmp, setSimilarTmp] = useState<string>();

  const [similarCheckedList, setSimilarCheckedList] = useState([]);
  const stantardValue = Form.useWatch('standard', form);
  const similarsValue = Form.useWatch('similarExpressions', form);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aigcRecommendModal, setAigcRRecommendModal] = useState(false);
  const [formValidate, setFormValidate] = useState(false);

  const standardInput = useRef(null);
  const overScrollRef = useRef(null);
  const { standardTitle, similarTitle, standardPlaceHolder, similarPlaceHolder, standardRepeatTxt, similarRepeatTxt } =
    ToolUseCaseConfig[toolUseCase] || {};
  const globalConfig = useRecoilValue(GlobalConfigState);
  const canAddCount = globalConfig.thesaurusExpressionGroupMaxCount;

  const forceValidateSimilars = async () => {
    const validateFieldsName = similarsValue?.map((__dirname, index) => ['similarExpressions', index]);
    if (!validateFieldsName?.length) return;
    try {
      await form.validateFields(validateFieldsName);
    } catch (e) {
      console.error(e);
    }
  };

  const standardValidator = useMemoizedFn(async (rule, value) => {
    if (formValidate) return;
    await forceValidateSimilars();
    return Promise.resolve();
  });

  const { run: validateRepeat } = useDebounceFn(
    async (value, name, errorDesc) => {
      if (!value?.trim()) return;
      // 校验知识库中是否已存在标准问题(不为空时才校验,若是编辑还得判断是否与初始标准问题相同）
      try {
        const { data } = await fetchSimilarWordsCheck({
          title: value,
          toolId,
          standardId: form.getFieldValue('standardId'),
        });
        if (data) {
          form.setFields([{ name, errors: [errorDesc] }]);
        }
      } catch (err) {
        console.error(err);
      }
    },
    { wait: 800 },
  );

  const doSimilarCheckAll = useMemoizedFn(async (similar) => {
    let error = '';

    error = similar === stantardValue ? `${similarTitle}不能和${standardTitle}相同` : '';
    if (error) return error;

    const findRes = similarsValue?.find((item) => item === similar);
    error = findRes ? `已有同样的${similarTitle}` : error;
    if (error) return error;
    try {
      const { data } = await fetchSimilarWordsCheck({
        title: similar,
        toolId,
        standardId: form.getFieldValue('standardId'),
      });
      error = data ? similarRepeatTxt : error;
    } catch (err) {
      console.error(err);
    }
    return error;
  });

  /**
   * 添加相似问题
   */
  const { run: addSimilar } = useDebounceFn(
    async (add, fields) => {
      const _tmpValue = similarTmp?.trim();
      if (!_tmpValue) {
        // 相似问题为空，无法添加
        setSimilarTmp('');
        return;
      }
      const error = await doSimilarCheckAll(_tmpValue);
      setSimilarTmpCheckError(error);
      if (!error) {
        if (_tmpValue) {
          add(_tmpValue);
          setSimilarTmp('');
          setTimeout(() => {
            overScrollRef?.current?.scrollToRow(fields.length);
          }, 0);
        }
      }
    },
    { wait: 500 },
  );

  const similarChecked = (checked, key) => {
    setSimilarCheckedList((prev) => (checked ? [...prev, key] : prev.filter((item) => item !== key)));
  };

  const similarValidator = useMemoizedFn(async (value, name) => {
    if (value === stantardValue) {
      return Promise.reject(new Error(`${similarTitle}不能和${standardTitle}相同`));
    }
    if (similarsValue?.find((item, otherIndex) => item === value && otherIndex !== name)) {
      return Promise.reject(new Error(`已有同样的${similarTitle}`));
    }

    return Promise.resolve();
  });

  const save = useMemoizedFn(async () => {
    // 等待一段时间让check校验完成
    setFormValidate(true);
    const errors = form.getFieldsError();
    if (errors.find((item) => item.errors?.length)) return;
    const values = await form.validateFields();
    const { standardId } = values;

    try {
      setSaveLoading(true);
      const apiCall = standardId ? fetchSimilarWordsUpdate : fetchSimilarWordsAdd;
      await apiCall({ ...values, toolId });
      message.success('添加成功');
      setFormValidate(false);
      setSaveLoading(false);
      onReturn();
    } catch (err) {
      setFormValidate(false);
      setSaveLoading(false);
      console.log('err', err);
    }
  });

  const toggleAigcRecommendModal = () => setAigcRRecommendModal((prev) => !prev);

  // 添加推荐的相似问题{id,name}
  const addSimilarQus = async (selectedRows) => {
    const recommendSimilarArr = selectedRows.map((item) => item.question);

    const newSimilars = similarsValue?.filter((item) => !!item) || [];
    recommendSimilarArr.forEach((item) => {
      if (!newSimilars?.includes(item) && item !== stantardValue) {
        newSimilars.push(item);
      }
    });
    form.setFieldValue('similarExpressions', newSimilars);
    form.validateFields(['similarExpressions']);
    await forceValidateSimilars();
    toggleAigcRecommendModal();
  };

  const onDelete = (onOk) => {
    Modal.confirm({
      title: '确认删除吗？',
      content: '删除后将无法恢复，请谨慎选择',
      onOk,
    });
  };

  return (
    <>
      <Button type="link" onClick={onReturn}>
        返回
      </Button>
      <Form form={form} initialValues={initData} className={`${modulePrefix}-form`}>
        <Form.Item name="standardId" noStyle>
          <></>
        </Form.Item>
        <FormItem
          {...FORM_ITEM_LAYOUT}
          label={standardTitle}
          name="standard"
          rules={[
            {
              required: true,
              message: `${standardTitle}不能为空`,
            },
            { pattern: trimPattern, message: '不能以空格开头和结尾' },
            { validator: standardValidator },
          ]}
          validateFirst={true}
        >
          <Input
            className={`${modulePrefix}-standardInput`}
            placeholder={standardPlaceHolder}
            autoComplete="off"
            maxLength={globalConfig.thesaurusExpressionLimit || 200}
            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
            ref={(node) => (standardInput.current = node)}
            onChange={({ target: { value } }) => validateRepeat(value, ['standard'], standardRepeatTxt)}
          />
        </FormItem>
        <Form.List
          name="similarExpressions"
          rules={[
            {
              validator: (rule, val) => {
                if (!val?.length) return Promise.reject(new Error(`${similarTitle}不能为空`));
                return Promise.resolve();
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => {
            // 虚拟列表行渲染器
            const rowRenderer = ({
              index, // 当前行索引
              key, // 唯一键
              style, // 行样式（必须应用）
            }) => {
              const { key: fieldKey, name } = fields[index];
              return (
                <div key={key} style={style}>
                  <Checkbox
                    style={{ marginRight: '20px' }}
                    checked={similarCheckedList?.includes(fieldKey)}
                    disabled={!fields?.length}
                    onChange={({ target: { checked } }) => similarChecked(checked, fieldKey)}
                  />

                  <FormItem
                    style={{ width: 'calc(100% - 100px)', display: 'inline-block' }}
                    name={name}
                    rules={[
                      { required: true, message: `${similarTitle}不能为空` },
                      { pattern: trimPattern, message: '不能以空格开头和结尾' },
                      {
                        validator: (_, value) => {
                          return similarValidator(value, name);
                        },
                      },
                    ]}
                    validateFirst={true}
                  >
                    <Input
                      className={`${modulePrefix}-similar-input`}
                      placeholder="填写此问题的其他问法"
                      autoComplete="off"
                      maxLength={globalConfig.thesaurusExpressionLimit || 200}
                      onChange={({ target: { value } }) =>
                        validateRepeat(value, ['similarExpressions', name], similarRepeatTxt)
                      }
                    />
                  </FormItem>
                  <Button type="link">
                    <Shanchu
                      onClick={() => {
                        onDelete(() => {
                          setSimilarCheckedList((pre) => pre.filter((item) => item !== fieldKey));
                          remove(name);
                        });
                      }}
                      color="currentColor"
                    />
                  </Button>
                </div>
              );
            };

            return (
              <>
                <FormItem
                  {...FORM_ITEM_LAYOUT}
                  validateStatus={similarTmpCheckError ? 'error' : ''}
                  help={similarTmpCheckError}
                  label={similarTitle}
                  required={true}
                >
                  <Input.Search
                    value={similarTmp}
                    style={{
                      width: 'calc(100% - 138px)',
                      marginRight: 15,
                    }}
                    maxLength={globalConfig.thesaurusExpressionLimit || 200}
                    onSearch={() => addSimilar(add, fields)}
                    onChange={(e) => {
                      setSimilarTmp(e.target.value);
                      setSimilarTmpCheckError('');
                    }}
                    enterButton={
                      <Button type="primary" disabled={!similarTmp}>
                        添加
                      </Button>
                    }
                    disabled={fields?.length >= canAddCount}
                    placeholder={similarPlaceHolder}
                  />
                  {/* 智能推荐问法 */}
                  <Tooltip
                    placement="right"
                    arrowPointAtCenter
                    title={
                      fields.filter((s) => !!s).length >= canAddCount
                        ? `${similarTitle}数量已达到上限，请修改后再查看推荐${similarTitle}`
                        : ''
                    }
                  >
                    <Button
                      type="primary"
                      style={{ width: '123px' }}
                      disabled={!stantardValue || fields.filter((s) => !!s).length >= canAddCount}
                      onClick={toggleAigcRecommendModal}
                    >
                      智能问法推荐
                    </Button>
                  </Tooltip>
                  <Form.ErrorList errors={errors} />
                </FormItem>

                {!!fields?.length && (
                  <div className={`${modulePrefix}-similar`}>
                    <div style={{ marginBottom: 10 }}>
                      <Checkbox
                        style={{ marginRight: 10 }}
                        indeterminate={similarCheckedList.length > 0 && similarCheckedList.length < fields?.length}
                        onChange={(e) => setSimilarCheckedList(e.target.checked ? fields.map((item) => item.key) : [])}
                        checked={similarCheckedList.length === fields?.length}
                      />
                      <span>全选</span>
                      <span>
                        (共{fields?.length}个{similarTitle})
                      </span>
                    </div>
                    <div className={`${modulePrefix}-similar-list`}>
                      <AutoSizer disableWidth>
                        {({ height }) => (
                          <VirtualList
                            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
                            ref={(node) => (overScrollRef.current = node)}
                            width={600} // 列表宽度
                            height={height} // 可视区域高度
                            rowCount={fields?.length}
                            rowHeight={54} // 单行高度（根据实际样式调整）
                            rowRenderer={rowRenderer}
                          />
                        )}
                      </AutoSizer>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 10, marginLeft: '16%' }}>
                  {!!similarCheckedList.length && (
                    <span style={{ float: 'left', lineHeight: '30px' }}>已选中{similarCheckedList.length || 0}个</span>
                  )}
                  <Button
                    disabled={!similarCheckedList.length}
                    onClick={() =>
                      onDelete(() => {
                        const removeNames = similarCheckedList.map((checkedKey, index) => {
                          const removeName = fields.find((item) => item.key === checkedKey).name;
                          return removeName;
                        });
                        remove(removeNames);
                        setSimilarCheckedList([]);
                      })
                    }
                    style={{ float: 'right' }}
                  >
                    删除
                  </Button>
                </div>
              </>
            );
          }}
        </Form.List>
      </Form>
      <div className={StepActionClassName}>
        <Button type="primary" onClick={save} loading={saveLoading}>
          保存
        </Button>
      </div>
      {aigcRecommendModal && (
        <AigcRecommendModal
          toolId={toolId}
          showAigcRecommendModal={aigcRecommendModal}
          toggleAigcRecommendModal={toggleAigcRecommendModal}
          addSimilarQus={addSimilarQus}
          standardQuestion={stantardValue}
          hasExistedQus={cloneDeep(similarsValue || [])}
          selfCreatedQusNum={cloneDeep(similarsValue || [])?.filter((s) => !!s).length}
          standardId={form.getFieldValue('standardId')}
          toolUseCase={toolUseCase}
          canAddCount={canAddCount}
        />
      )}
    </>
  );
};

export default EditWord;

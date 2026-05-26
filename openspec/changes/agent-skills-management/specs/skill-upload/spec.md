# Skill Upload Specification

## ADDED Requirements

### Requirement: 上传 Skill 弹窗

系统 SHALL 提供上传 Skill 弹窗，支持文件上传功能。

#### Scenario: 打开上传弹窗

- **WHEN** 用户点击"上传 Skill"按钮
- **THEN** 系统弹出"上传 Skill"弹窗

### Requirement: 文件上传方式

系统 SHALL 支持拖拽和点击两种文件上传方式。

#### Scenario: 拖拽上传

- **WHEN** 用户将文件拖拽到上传区域
- **THEN** 系统接受文件并准备上传

#### Scenario: 点击上传

- **WHEN** 用户点击上传区域
- **THEN** 系统打开文件选择对话框

### Requirement: 文件格式验证

系统 SHALL 只接受.zip 和.skill 格式的文件。

#### Scenario: 格式验证

- **WHEN** 用户选择非.zip 或.skill 格式的文件
- **THEN** 系统显示错误提示，拒绝上传
- **WHEN** 用户选择.zip 或.skill 格式的文件
- **THEN** 系统接受文件并准备上传

### Requirement: 上传提示文案

系统 SHALL 显示清晰的上传提示文案。

#### Scenario: 提示文案显示

- **WHEN** 用户打开上传弹窗
- **THEN** 系统显示提示文案："请将文件拖拽此处，或点击上传。只能上传 Skill 文件包，格式为.Zip 或.skill"

### Requirement: 上传按钮功能

系统 SHALL 提供上传和取消按钮。

#### Scenario: 点击上传按钮

- **WHEN** 用户选择文件后点击"上传"按钮
- **THEN** 系统立即关闭上传弹窗
- **THEN** 系统刷新 Skill 列表，在最上方展示最新上传的 Skill
- **THEN** 系统弹出 toast 提示"上传中，请稍后"

#### Scenario: 点击取消按钮

- **WHEN** 用户点击"取消"按钮
- **THEN** 系统关闭上传弹窗，不执行上传操作

### Requirement: 上传状态处理

系统 SHALL 正确处理上传过程中的各种状态。

#### Scenario: 上传成功

- **WHEN** 文件上传成功
- **THEN** 系统在列表中显示"成功"状态

#### Scenario: 上传失败

- **WHEN** 文件上传失败
- **THEN** 系统在列表中显示"上传失败"状态

#### Scenario: 上传中

- **WHEN** 文件正在上传
- **THEN** 系统在列表中显示"上传中"状态

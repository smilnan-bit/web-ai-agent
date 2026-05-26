/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

export { CustomService } from './custom-service';

/**
 * 抽象类
 */
export {
  ValidationService,
  useValidationService,
  useValidationServiceStore,
  type ValidateError,
  type ValidationState,
  type ValidateResult,
  type ValidateErrorMap,
  type WorkflowValidateError,
  type WorkflowValidateErrorMap,
} from './validation-service';

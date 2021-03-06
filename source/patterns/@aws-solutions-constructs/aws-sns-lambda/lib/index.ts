/**
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as kms from '@aws-cdk/aws-kms';
import * as defaults from '@aws-solutions-constructs/core';
import { Construct } from '@aws-cdk/core';
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources';

/**
 * @summary The properties for the SnsToLambda class.
 */
export interface SnsToLambdaProps {
  /**
   * Existing instance of Lambda Function object, if this is set then the lambdaFunctionProps is ignored.
   *
   * @default - None
   */
  readonly existingLambdaObj?: lambda.Function,
  /**
   * User provided props to override the default props for the Lambda function.
   *
   * @default - Default properties are used.
   */
  readonly lambdaFunctionProps?: lambda.FunctionProps,
  /**
   * Optional user provided properties to override the default properties for the SNS topic.
   *
   * @default - Default properties are used.
   */
  readonly topicProps?: sns.TopicProps,
  /**
   * Use a KMS Key, either managed by this CDK app, or imported. If importing an encryption key, it must be specified in
   * the encryptionKey property for this construct.
   *
   * @default - true (encryption enabled, managed by this CDK app).
   */
  readonly enableEncryption?: boolean
  /**
   * An optional, imported encryption key to encrypt the SNS topic with.
   *
   * @default - not specified.
   */
  readonly encryptionKey?: kms.Key
}

/**
 * @summary The SnsToLambda class.
 */
export class SnsToLambda extends Construct {
  public readonly lambdaFunction: lambda.Function;
  public readonly snsTopic: sns.Topic;
  public readonly encryptionKey: kms.Key;

  /**
   * @summary Constructs a new instance of the LambdaToSns class.
   * @param {cdk.App} scope - represents the scope for all the resources.
   * @param {string} id - this is a a scope-unique id.
   * @param {LambdaToSnsProps} props - user provided props for the construct.
   * @since 0.8.0
   * @access public
   */
  constructor(scope: Construct, id: string, props: SnsToLambdaProps) {
    super(scope, id);

    // Setup the Lambda function
    this.lambdaFunction = defaults.buildLambdaFunction(this, {
        existingLambdaObj: props.existingLambdaObj,
        lambdaFunctionProps: props.lambdaFunctionProps
    });

    // Setup the SNS topic
    [this.snsTopic, this.encryptionKey] = defaults.buildTopic(this, {
        enableEncryption: props.enableEncryption,
        encryptionKey: props.encryptionKey
    });

    this.lambdaFunction.addEventSource(new SnsEventSource(this.snsTopic));
  }
}
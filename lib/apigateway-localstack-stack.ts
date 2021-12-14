import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import { Asset }  from '@aws-cdk/aws-s3-assets';

export class ApigatewayLocalstackStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const asset = new Asset(this, `ExampleAPIAsset`, {
      path: './lib/apigateway/oas30.yaml'
    });
    const assetLocation = cdk.Fn.transform('AWS::Include', {Location: asset.s3ObjectUrl});
    const api = new apigateway.SpecRestApi(this, 'api', {
      restApiName: 'ExampleAPI',
      apiDefinition: apigateway.ApiDefinition.fromInline(assetLocation),
      deploy: true,
      deployOptions: {
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        stageName: 'example',
      },
      endpointExportName: 'ExampleEndpoint',
      cloudWatchRole: false,
    });

    const func = new lambda.Function(this, 'ExampleFunction', {
      functionName: 'Example',
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('./lib/lambda'),
      handler: 'index.handler',
    });

    const logicalId = 'TestFunc';

    const cfnFunc = func.node.defaultChild as lambda.CfnFunction;
    cfnFunc.overrideLogicalId(logicalId);

    const apiPath = '*/POST/test'; // `${api.deploymentStage.stageName}/POST/${resource-name}`;
    const apiArn = `arn:${this.partition}:execute-api:${this.region}:${this.account}:${api.restApiId}/${apiPath}`;
    func.addPermission(`Permission`, {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: apiArn,
    });
  }
}
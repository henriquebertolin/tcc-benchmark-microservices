import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

interface Ec2StackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  ec2SecurityGroup: ec2.SecurityGroup;
  dbEndpoint: string;
  dbSecretArn: string;
}

export class Ec2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2StackProps) {
    super(scope, id, props);

    const role = new iam.Role(this, 'Ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
      ],
    });

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'dnf update -y',
      'dnf install -y docker git jq aws-cli',
      'systemctl enable docker',
      'systemctl start docker',
      'usermod -aG docker ec2-user'
    );

    const instance = new ec2.Instance(this, 'BenchmarkEc2', {
    vpc: props.vpc,
    vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
    },
    securityGroup: props.ec2SecurityGroup,
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
    machineImage: ec2.MachineImage.latestAmazonLinux2023(),
    role,
    userData,
    keyName: 'tcc-key',
    });

    new cdk.CfnOutput(this, 'Ec2PublicIp', {
      value: instance.instancePublicIp,
    });

    new cdk.CfnOutput(this, 'DbEndpointFromPersistent', {
      value: props.dbEndpoint,
    });

    new cdk.CfnOutput(this, 'DbSecretArnFromPersistent', {
      value: props.dbSecretArn,
    });
  }
}
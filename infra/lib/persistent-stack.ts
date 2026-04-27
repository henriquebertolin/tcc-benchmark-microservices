import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

export class PersistentStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly ec2SecurityGroup: ec2.SecurityGroup;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;
  public readonly rdsSecurityGroup: ec2.SecurityGroup;
  public readonly dbEndpoint: string;
  public readonly dbSecretArn: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'BenchmarkVpc', {
      natGateways: 1,
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private-isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
        {
          name: 'private-egress',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    });

    this.ec2SecurityGroup = new ec2.SecurityGroup(this, 'Ec2SecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      description: 'Security group da EC2',
    });

    this.ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'SSH'
    );

    this.ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3001),
      'Orders service'
    );

    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      description: 'Security group das Lambdas',
    });

    this.rdsSecurityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      description: 'Security group do RDS',
    });

    this.rdsSecurityGroup.addIngressRule(
      this.ec2SecurityGroup,
      ec2.Port.tcp(5432),
      'Permitir EC2 acessar Postgres'
    );

    this.rdsSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Permitir Lambdas acessar Postgres'
    );

    const db = new rds.DatabaseInstance(this, 'BenchmarkDatabase', {
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [this.rdsSecurityGroup],
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      allocatedStorage: 20,
      storageType: rds.StorageType.GP3,
      databaseName: 'benchmarkdb',
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      multiAz: false,
      publiclyAccessible: false,
      deletionProtection: false,
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.dbEndpoint = db.dbInstanceEndpointAddress;
    this.dbSecretArn = db.secret!.secretArn;

    new cdk.CfnOutput(this, 'DbEndpoint', {
      value: this.dbEndpoint,
    });

    new cdk.CfnOutput(this, 'DbSecretArn', {
      value: this.dbSecretArn,
    });
  }
}
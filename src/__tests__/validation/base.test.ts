import { AppSyncConfigInput } from '../../getAppSyncConfig';
import { validateConfig } from '../../validation';
import { basicConfig } from '../basicConfig';

describe('Valdiation', () => {
  it('should validate ', () => {
    expect(function () {
      validateConfig({
        unknownPorp: 'foo',
      });
    }).toThrowErrorMatchingSnapshot();
  });

  describe('Log', () => {
    describe('Valid', () => {
      const assertions = [
        {
          name: 'Minimum',
          config: {
            ...basicConfig,
            logging: {
              level: 'ALL',
            },
          } as AppSyncConfigInput,
        },
        {
          name: 'Full',
          config: {
            ...basicConfig,
            logging: {
              level: 'ALL',
              retentionInDays: 14,
              excludeVerboseContent: true,
              loggingRoleArn: { Ref: 'MyLogGorupArn' },
            },
          } as AppSyncConfigInput,
        },
      ];

      assertions.forEach((config) => {
        it(`should validate a ${config.name}`, () => {
          expect(validateConfig(config.config)).toBe(true);
        });
      });
    });

    describe('Invalid', () => {
      const assertions = [
        {
          name: 'Invalid',
          config: {
            ...basicConfig,
            logging: {
              level: 'FOO',
              retentionInDays: 'bar',
              excludeVerboseContent: 'buzz',
              loggingRoleArn: 123,
            },
          },
        },
      ];

      assertions.forEach((config) => {
        it(`should validate a ${config.name}`, () => {
          expect(function () {
            validateConfig(config.config);
          }).toThrowErrorMatchingSnapshot();
        });
      });
    });
  });

  describe('Waf', () => {
    describe('Valid', () => {
      const assertions = [
        {
          name: 'Minimum',
          config: {
            ...basicConfig,
            waf: {
              rules: [],
            },
          } as AppSyncConfigInput,
        },
        {
          name: 'Full',
          config: {
            ...basicConfig,
            waf: {
              enabled: true,
              name: 'MyWaf',
              defaultAction: 'Allow',
              description: 'My Waf rules',
              visibilityConfig: {
                name: 'myRule',
                cloudWatchMetricsEnabled: true,
                sampledRequestsEnabled: true,
              },
              rules: [
                'throttle',
                { throttle: 100 },
                {
                  throttle: {
                    name: 'Throttle',
                    action: 'Block',
                    limit: 200,
                    priority: 200,
                    aggregateKeyType: 'IP',
                    forwardedIPConfig: {
                      headerName: 'X-Forwarded-For',
                      fallbackBehavior: 'MATCH',
                    },
                    visibilityConfig: {
                      name: 'throttle200',
                      cloudWatchMetricsEnabled: true,
                      sampledRequestsEnabled: true,
                    },
                  },
                },
                'disableIntrospection',
                {
                  disableIntrospection: {
                    name: 'Disable Intorspection',
                    priority: 100,
                    visibilityConfig: {
                      name: 'DisableIntrospection',
                      cloudWatchMetricsEnabled: true,
                      sampledRequestsEnabled: true,
                    },
                  },
                },
                {
                  name: 'Custom Rule',
                  action: 'Count',
                  priority: 500,
                  statement: {
                    NotStatement: {
                      Statement: {
                        GeoMatchStatement: {
                          CountryCodes: ['US'],
                        },
                      },
                    },
                  },
                  visibilityConfig: {
                    name: 'myRule',
                    cloudWatchMetricsEnabled: true,
                    sampledRequestsEnabled: true,
                  },
                },
              ],
            },
          } as AppSyncConfigInput,
        },
        {
          name: 'Using arn',
          config: {
            ...basicConfig,
            waf: {
              enabled: true,
              arn: 'arn:aws:',
            },
          },
        },
      ];

      assertions.forEach((config) => {
        it(`should validate a ${config.name}`, () => {
          expect(validateConfig(config.config)).toBe(true);
        });
      });
    });

    describe('Invalid', () => {
      const assertions = [
        {
          name: 'Invalid',
          config: {
            ...basicConfig,
            waf: {
              enabled: 'foo',
              name: 123,
              defaultAction: 'Buzz',
              visibilityConfig: {
                name: 123,
                cloudWatchMetricsEnabled: 456,
                sampledRequestsEnabled: 789,
              },
              rules: [
                'fake',
                { invalid: 100 },
                {
                  name: 123,
                  statement: 456,
                },
              ],
            },
          },
        },
        {
          name: 'Invalid arn',
          config: {
            ...basicConfig,
            waf: {
              arn: 123,
            },
          },
        },
        {
          name: 'Throttle limit',
          config: {
            ...basicConfig,
            waf: {
              rules: [
                { throttle: 99 },
                {
                  throttle: {
                    name: 'Throttle',
                    limit: 99,
                  },
                },
              ],
            },
          },
        },
      ];

      assertions.forEach((config) => {
        it(`should validate a ${config.name}`, () => {
          expect(function () {
            validateConfig(config.config);
          }).toThrowErrorMatchingSnapshot();
        });
      });
    });
  });

  describe('Domain', () => {
    describe('Valid', () => {
      const assertions = [
        {
          name: 'Minimum',
          config: {
            ...basicConfig,
            domain: {
              name: 'api.example.com',
              certificateArn: 'arn:aws:',
            },
          } as AppSyncConfigInput,
        },
        {
          name: 'Full',
          config: {
            ...basicConfig,
            domain: {
              enabled: true,
              certificateArn: 'arn:aws:',
              name: 'api.example.com',
              hostedZoneId: 'Z111111QQQQQQQ',
              hostedZoneName: 'example.com.',
              route53: true,
            },
          } as AppSyncConfigInput,
        },
        {
          name: 'useCloudFormation: false, missing certificateArn',
          config: {
            ...basicConfig,
            domain: {
              name: 'api.example.com',
              useCloudFormation: false,
            },
          } as AppSyncConfigInput,
        },
      ];

      assertions.forEach((config) => {
        it(`should validate a ${config.name}`, () => {
          expect(validateConfig(config.config)).toBe(true);
        });
      });
    });

    describe('Invalid', () => {
      const assertions = [
        {
          name: 'Invalid',
          config: {
            ...basicConfig,
            domain: {
              enabled: 'foo',
              name: 'bar',
              certificateArn: 123,
              route53: 123,
            },
          },
        },
        {
          name: 'useCloudFormation: true, certificateArn or hostedZoneId is required',
          config: {
            ...basicConfig,
            domain: {
              name: 'api.example.com',
              useCloudFormation: true,
            },
          },
        },
        {
          name: 'useCloudFormation: not present, certificateArn or hostedZoneId is required',
          config: {
            ...basicConfig,
            domain: {
              name: 'api.example.com',
            },
          },
        },
        {
          name: 'Invalid Route 53',
          config: {
            ...basicConfig,
            domain: {
              name: 'bar',
              certificateArn: 'arn:aws:',
              route53: {
                hostedZoneId: 456,
                hostedZoneName: 789,
              },
            },
          },
        },
      ];

      assertions.forEach((config) => {
        it(`should validate a ${config.name}`, () => {
          expect(function () {
            validateConfig(config.config);
          }).toThrowErrorMatchingSnapshot();
        });
      });
    });
  });

  describe('Caching', () => {
    describe('Valid', () => {
      const assertions = [
        {
          name: 'Minimum',
          config: {
            ...basicConfig,
            caching: {
              behavior: 'PER_RESOLVER_CACHING',
            },
          } as AppSyncConfigInput,
        },
        {
          name: 'Full',
          config: {
            ...basicConfig,
            caching: {
              enabled: true,
              behavior: 'PER_RESOLVER_CACHING',
              type: 'SMALL',
              ttl: 3600,
              atRestEncryption: true,
              transitEncryption: true,
            },
          } as AppSyncConfigInput,
        },
      ];

      assertions.forEach((config) => {
        it(`should validate a ${config.name}`, () => {
          expect(validateConfig(config.config)).toBe(true);
        });
      });
    });

    describe('Invalid', () => {
      const assertions = [
        {
          name: 'Invalid',
          config: {
            ...basicConfig,
            caching: {
              enabled: 'foo',
              behavior: 'bar',
              type: 'INVALID',
              ttl: 'bizz',
              atRestEncryption: 'bizz',
              transitEncryption: 'bazz',
            },
          },
        },
        {
          name: 'Ttl min value',
          config: {
            ...basicConfig,
            caching: {
              behavior: 'PER_RESOLVER_CACHING',
              ttl: 0,
            },
          },
        },
        {
          name: 'Ttl max value',
          config: {
            ...basicConfig,
            caching: {
              behavior: 'PER_RESOLVER_CACHING',
              ttl: 3601,
            },
          },
        },
      ];

      assertions.forEach((config) => {
        it(`should validate a ${config.name}`, () => {
          expect(function () {
            validateConfig(config.config);
          }).toThrowErrorMatchingSnapshot();
        });
      });
    });
  });
});

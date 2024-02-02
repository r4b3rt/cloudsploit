var expect = require('chai').expect;
var computeGalleryRbac = require('./computeGalleryRbac');

const computeGalleries = [
    {
        "name": "testgallery",
        "id": "/subscriptions/26a1a07e-06dd-4892-92c9-e4996b0fc546/resourceGroups/MEERAB-RG/providers/Microsoft.Compute/galleries/testgallery",
        "type": "Microsoft.Compute/galleries",
        "location": "eastus",
        "tags": {},
        "identifier": {
            "uniqueName": "26a1a07e-06dd-4892-92c9-e4996b0fc546-TESTGALLERY"
        },
        "provisioningState": "Succeeded",
        "sharingProfile": {
            "permissions": "Private"
          },

    },
    {
        "name": "testgallerymeerab",
        "id": "/subscriptions/26a1a07e-06dd-4892-92c9-e4996b0fc546/resourceGroups/MEERAB-RG/providers/Microsoft.Compute/galleries/testgallerymeerab",
        "type": "Microsoft.Compute/galleries",
        "location": "eastus",
        "tags": {},
        "identifier": {
            "uniqueName": "26a1a07e-06dd-4892-92c9-e4996b0fc546-TESTGALLERYMEERAB"
        },
        "sharingProfile": {
            "permissions": "Community",
            "communityGalleryInfo": {
                "communityGalleryEnabled": true,
                "publisherUri": "www.test.com",
                "publisherContact": "meerabshafique93704@gmail.com",
                "eula": "www.test.com",
                "publicNamePrefix": "testtesttest",
                "publicNames": [
                    "testtesttest-1fb35c99-9f7d-4e54-9b12-bd35cf2602f7"
                ]
            }
        },
        "provisioningState": "Succeeded"
    },
    {
        "name": "testgallerymeerab",
        "id": "/subscriptions/26a1a07e-06dd-4892-92c9-e4996b0fc546/resourceGroups/MEERAB-RG/providers/Microsoft.Compute/galleries/testgallerymeerab",
        "type": "Microsoft.Compute/galleries",
        "location": "eastus",
        "tags": {},
        "identifier": {
            "uniqueName": "26a1a07e-06dd-4892-92c9-e4996b0fc546-TESTGALLERYMEERAB"
        },
        "sharingProfile": {
            "permissions": "Groups",
            "groups": [
              {
                "type": "Subscriptions",
                "ids": [
                  "34a4ab42-0d72-47d9-bd1a-aed207386dac",
                  "380fd389-260b-41aa-bad9-0a83108c370b"
                ]
              },
              {
                "type": "AADTenants",
                "ids": [
                  "c24c76aa-8897-4027-9b03-8f7928b54ff6"
                ]
              }
            ]
          },
        "provisioningState": "Succeeded"
    }

];

const createCache = (computeGalleries) => {
    let gallery = {};
    if (computeGalleries) {
        gallery['data'] = computeGalleries;
    }
    return {
        computeGalleries: {
            list: {
                'eastus': gallery
            }
        }
    };
};

describe('computeGalleryRbac', function () {
    describe('run', function () {
        it('should give passing result if No existing Compute Galleries found', function (done) {
            const cache = createCache([]);
            computeGalleryRbac.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                expect(results[0].message).to.include('No existing Compute Galleries found');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });

        it('should give unknown result if unable to query for Compute Galleries', function (done) {
            const cache = createCache(null);
            computeGalleryRbac.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(3);
                expect(results[0].message).to.include('Unable to query for Compute Galleries');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });

        it('should give failing result if Compute Gallery has community shared setting', function (done) {
            const cache = createCache([computeGalleries[1]]);
            computeGalleryRbac.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(2);
                expect(results[0].message).to.include('Compute Gallery does not have RBAC enabled');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });

        it('should give failing result if Compute Gallery has group shared setting', function (done) {
            const cache = createCache([computeGalleries[2]]);
            computeGalleryRbac.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(2);
                expect(results[0].message).to.include('Compute Gallery does not have RBAC enabled');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });

        it('should give passing result if Compute Gallery has RBAC enabled', function (done) {
            const cache = createCache([computeGalleries[0]]);
            computeGalleryRbac.run(cache, {}, (err, results) => {
                expect(results.length).to.equal(1);
                expect(results[0].status).to.equal(0);
                expect(results[0].message).to.include('Compute Gallery has RBAC enabled');
                expect(results[0].region).to.equal('eastus');
                done();
            });
        });

    });
});
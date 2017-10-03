/**
 * Created by timsuchanek on 10/14/16.
 */

export function query(query): Promise<any> {
  if (query.match(/allArtists/)) {
    return new Promise((resolve, reject) => {
      resolve({
        'viewer': {
          'allArtists': {
            'edges': [
              {
                'node': {
                  'id': 'cink6lsyw002e01rnakgeqdy5',
                  'description': 'Artist from Brooklyn, NY',
                  'name': 'Anil Duran',
                  'artwork': {
                    'id': 'cim1z9003001q0plmsdl2bkfc',
                  },
                },
              },
              {
                'node': {
                  'id': 'cink6kdmu002b01rnvcd0m8sa',
                  'description': 'Artist from Croatia',
                  'name': 'Manuela Pieri',
                  'artwork': {
                    'id': 'cim1zk8f1004p0plmw0voxhdv',
                  },
                },
              },
              {
                'node': {
                  'id': 'cink6int2002801rnjxxpvj3m',
                  'description': 'Self Portrait with Felt Hat (1887)',
                  'name': 'Vincent Van Gogh',
                  'artwork': {
                    'id': 'cim5895og00dy0pp1t2efj14j',
                  },
                },
              }],
              'count': 3,
          },
        },
      })
    })
  }

  return Promise.reject({})
}

export function mutate(mutation): Promise<any> {
  if (mutation.match(/createArtist/)) {
    return Promise.resolve({
      createArtist: {
        artist: {
          id: 'ciu9st9820sgt0128cviki4sf',
          name: 'some name',
          description: 'some description',
          artwork: {
            id: 'cilr7v2hb004a0pl8hv92r3k4',
          },
        },
      },
    })
  }

  if (mutation.match(/updateArtist/)) {
    return Promise.resolve({
      updateArtist: {
        artist: {
          id: 'ciu9st9820sgt0128cviki4sf',
        },
      },
    })
  }

  if (mutation.match(/deleteArtist/)) {
    return Promise.resolve({
      deleteArtist: {
        deleteId: 'ciu9st9820sgt0128cviki4sf',
      },
    })
  }

  return Promise.reject({})
}

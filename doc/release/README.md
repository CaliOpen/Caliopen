# Release

Things to do for a new release...

## 1. Prepare

* Merge all the things in `master` branch
  ```
  git checkout develop && git pull
  git checkout master && git pull
  git merge develop
  ```
* Make sure `CHANGELOG.md` is up to date according to http://keepachangelog.com (and don't forget **to add the version you want to release**, it is not automated, keep semver notation of the version e.g `0.24.0`)
* Stash or commit if you have changes
* Change the version of caliopen packages (python and virtualenv are required):

  ```bash
  cd devtools
  # or you can use `setup-virtualenv.sh`
  virtualenv --python=python2.7 ./.venv
  source .venv/bin/activate
  pip install -r ./manage_package-requirements.txt
  ./manage_package --help
  # change in the following the package name you want (refer to packages.yaml e.g "client", etc. or all) and the version
  ./manage_package --conf ./packages.yaml create_version all 0.18.1
  deactivate
  ```
* Add a tag for the release, the tag will be signed and annoted:
  ```
  git tag -a -s release-0.18.0
  ```
* Publish the release on github:
  ```
  git push
  git push origin release-0.18.0
  ```
* Create a new release https://github.com/CaliOpen/Caliopen/releases/new and specify the tag name you've just published e.g. `release-0.18.0`

## 2. Build images & Publish

### Prepare

```
# checkout the tag you need to build
git checkout release-X.Y.Z

cd devtools

# Make sure having credential for registry access
cp registry.conf.template registry.conf
vi registry.conf

# Note: It's excluded from git objects in .gitignore file.

# Define environment variables for version and application to deploy

export CALIOPEN_VERSION=X.Y.Z
export APP_NAME=<package>
```

### Build and publish

This will build the container related to the given application and publish it on the docker images registry using 2 tags:
- `${APP_NAME}/latest`
- `${APP_NAME}/${CALIOPEN_VERSION}`

```
cd devtools
make master
```

## 3. Deploy

cf. [Deploy Kubernetes](./deploy_kubernetes.md)

## 4. Communicate

cf. [Communication](./Communication.md)

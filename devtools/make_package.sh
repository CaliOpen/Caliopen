#!/bin/bash
#
# Script to make a Caliopen package
#

BASEDIR="`pwd`/.."
DISTDIR="${BASEDIR}/dist"


function make_python_package() {
	local name=$1
	local directory=$2
	cd ${BASEDIR}/${directory}
	echo "Building python wheel ${name}"
	python setup.py bdist_wheel --universal --dist-dir ${DISTDIR}
}


while getopts "t:s:n:" opt; do
    case $opt in
        t) lang_type=${OPTARG}
           ;;
        s) source_dir=${OPTARG}
           ;;
        n) package_name=${OPTARG}
		   ;;
        \?) echo "Invalid option -${OPTARG}" >&2
            exit 1
           ;;
    esac
done

echo "Will make package ${source_dir} in language ${lang_type}"

if [[ ! -d "${BASEDIR}/${source_dir}" ]]; then
	echo "No such source directory ${BASEDIR}/${source_dir}"
	exit 1
fi


if [[ "${lang_type}" == "python" ]]; then
	make_python_package ${package_name} ${source_dir}
else
	echo "Not supported language ${lang_type}"
	exit 1
fi


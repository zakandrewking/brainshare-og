#!/usr/bin/env python

from setuptools import setup, find_packages

setup(
    name="brain-cli",
    version="0.1.0",
    description="Brainshare CLI",
    url="https://brainshare.io",
    packages=find_packages(),
    install_requires=["typer>=0.4.0,<0.5"],
    extras_require={"dev": ["mypy", "black", "types-setuptools"]},
)

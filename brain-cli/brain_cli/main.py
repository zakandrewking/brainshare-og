import typer
import yaml

app = typer.Typer()

defaults = {"build-directory": ".brain-build"}
required = ["name"]


def load_config() -> None:
    # get current directory
    pass


def get_from_config(key: str) -> str:
    if key in brainshare_yml:
        return brainshare_yml[key]
    else:
        return defaults[key]


build_directory = get_from_config("build-directory")


@app.command()
def main(name: str) -> None:
    typer.echo(f"Hello {name}")


@app.command()
def eject() -> None:
    typer.echo("Not implemented")


@app.command()
def up() -> None:
    sys.call("cd $BUILD_PATH")
    sys.call("docker-compose up")

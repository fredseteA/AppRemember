from utils.slug import slugify


def test_remove_acentos():
    assert slugify("João") == "joao"
    assert slugify("José") == "jose"


def test_converte_para_minusculo():
    assert slugify("TESTE") == "teste"


def test_substitui_espacos_por_hifen():
    assert slugify("Maria Silva") == "maria-silva"


def test_remove_caracteres_especiais():
    assert slugify("teste!@#$%") == "teste"


def test_slug_composto():
    assert slugify("Ana Paula de Souza") == "ana-paula-de-souza"


def test_sem_hifen_nas_bordas():
    result = slugify("  teste  ")
    assert not result.startswith("-")
    assert not result.endswith("-")
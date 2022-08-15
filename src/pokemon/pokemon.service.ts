import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Pokemon exist in db ${JSON.stringify(error.keyValue)}`,
        );
      }
      console.log(error);
      throw new InternalServerErrorException(
        `Can't create pokemon - Check server logs`,
      );
    }
  }

  async findAll() {
    return await this.pokemonModel.find();
  }

  async findOne(searchParameter: string) {
    let pokemon: Pokemon;

    // By no
    if (!isNaN(+searchParameter)) {
      pokemon = await this.pokemonModel.findOne({ no: searchParameter });
    }

    //By MongoID
    if (!pokemon && isValidObjectId(searchParameter)) {
      pokemon = await this.pokemonModel.findById(searchParameter);
    }

    //By name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: searchParameter.toLocaleLowerCase().trim(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with the specified parameter ("${searchParameter}") not found`,
      );
    return pokemon;
  }

  async update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return await this.pokemonModel.findByIdAndUpdate(id, updatePokemonDto);
  }

  async remove(idToSearchAndDelete: string) {
    return await this.pokemonModel.findByIdAndDelete(idToSearchAndDelete);
  }
}
